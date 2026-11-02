import 'reflect-metadata';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import test from 'node:test';
import { Reflector } from '@nestjs/core';
import { AuthorizationGuard } from '../../dist/authorization/authorization.guard.js';
import { AuthorizationService } from '../../dist/authorization/authorization.service.js';
import { createValidationPipe } from '../../dist/common/http/validation.pipe.js';
import { FloorController } from '../../dist/floor/floor.controller.js';
import { CreateAreaDto, CreateTableDto, UpdateTableDto } from '../../dist/floor/dto/floor.dto.js';

const root=resolve(import.meta.dirname,'../..');
async function validate(type,value){return createValidationPipe().transform(value,{type:'body',metatype:type})}

test('esquema y SQL preparan aislamiento y una sola sesión abierta',async()=>{
 const schema=await readFile(resolve(root,'prisma/schema.prisma'),'utf8'); const sql=await readFile(resolve(root,'prisma/migrations/20261102000100_areas_tables_sessions/migration.sql'),'utf8');
 for(const model of ['model Area','model DiningTable','model TableSession'])assert.match(schema,new RegExp(model));
 assert.match(schema,/@@unique\(\[id,organizationId,branchId\]\)/); assert.match(sql,/CHECK \("capacity" > 0\)/); assert.match(sql,/table_sessions_one_open_per_table[\s\S]*WHERE "status" = 'OPEN'/); assert.match(sql,/dining_tables_area_scope_fkey/);
});

test('ValidationPipe rechaza capacidad inválida, nulos, inmutables y propiedades desconocidas',async()=>{
 const areaId='11111111-1111-4111-8111-111111111111'; await assert.rejects(()=>validate(CreateAreaDto,{code:'salon',displayName:'   '}),{status:400}); await assert.rejects(()=>validate(CreateTableDto,{code:'m-1',areaId,capacity:0}),{status:400}); await assert.rejects(()=>validate(CreateTableDto,{code:'m-1',areaId:null,capacity:4}),{status:400}); await assert.rejects(()=>validate(CreateTableDto,{code:'m-1',areaId:'area',capacity:4}),{status:400}); await assert.rejects(()=>validate(UpdateTableDto,{branchId:'x'}),{status:400}); await assert.rejects(()=>validate(UpdateTableDto,{capacity:2,deviceId:'x'}),{status:400});
 const table=await validate(CreateTableDto,{code:'m-1',areaId,capacity:4}); assert.equal(table.capacity,4);
});

test('AuthorizationGuard real exige scope de sucursal y permiso de sesión',async()=>{
 const grants=[{userId:'u',organizationId:'o',branchId:'b1',scope:'BRANCH',organization:{status:'ACTIVE'},branch:{status:'ACTIVE',organizationId:'o'},role:{code:'R',status:'ACTIVE',permissions:[{permission:{code:'table-sessions.manage',status:'ACTIVE'}}]}}];
 const prisma={userRole:{findMany:async({where})=>grants.filter(x=>x.userId===where.userId)},branch:{findFirst:async({where})=>where.id==='b1'&&where.organizationId==='o'&&where.status==='ACTIVE'?{id:'b1'}:null}};
 const guard=new AuthorizationGuard(new Reflector(),new AuthorizationService(prisma)); const context=(branchId)=>({getHandler:()=>FloorController.prototype.open,getClass:()=>FloorController,switchToHttp:()=>({getRequest:()=>({auth:{userId:'u'},params:{organizationId:'o',branchId}})})});
 assert.equal(await guard.canActivate(context('b1')),true); await assert.rejects(()=>guard.canActivate(context('b2')),{status:403});
});
