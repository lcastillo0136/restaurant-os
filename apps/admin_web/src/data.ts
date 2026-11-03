export type Permission =
  | 'organizations.read'
  | 'organizations.manage'
  | 'branches.read'
  | 'branches.manage'
  | 'employees.read'
  | 'employees.manage'
  | 'work-shifts.read'
  | 'work-shifts.manage'
  | 'areas.read'
  | 'areas.manage'
  | 'tables.read'
  | 'tables.manage'
  | 'table-sessions.read'
  | 'table-sessions.manage';

export type ApiError = {
  status: 400 | 401 | 403 | 404 | 409 | 500 | 0;
  message: string;
};

export type DemoSimulationMode =
  | 'ONLINE'
  | 'OFFLINE'
  | 'READ_ERROR'
  | 'MUTATION_REJECTED'
  | 'SESSION_EXPIRED'
  | 'FORBIDDEN';

export type Branch = {
  id: string;
  code: string;
  displayName: string;
  timeZone: string;
  status: 'ACTIVE' | 'INACTIVE';
};

export type Employee = {
  id: string;
  organizationId: string;
  employeeCode: string;
  displayName: string;
  status: 'ACTIVE' | 'INACTIVE';
};

export type EmployeeBranchAssignmentStatus = 'ACTIVE' | 'INACTIVE' | 'CANCELED';

export type EmployeeBranchAssignment = {
  id: string;
  organizationId: string;
  employeeId: string;
  branchId: string;
  status: EmployeeBranchAssignmentStatus;
};

export type CreateEmployeeBranchAssignmentInput = {
  organizationId: string;
  employeeId: string;
  branchId: string;
};

export type UpdateEmployeeBranchAssignmentStatusInput =
  CreateEmployeeBranchAssignmentInput & {
    status: Exclude<EmployeeBranchAssignmentStatus, 'ACTIVE'>;
  };

export type WorkShiftStatus = 'SCHEDULED' | 'CANCELED';

export type WorkShift = {
  id: string;
  organizationId: string;
  branchId: string;
  scheduledStart: string;
  scheduledEnd: string;
  status: WorkShiftStatus;
};

export type WorkShiftAssignmentStatus = 'ACTIVE' | 'INACTIVE' | 'CANCELED';

export type WorkShiftAssignment = {
  id: string;
  workShiftId: string;
  employeeId: string;
  organizationId: string;
  branchId: string;
  status: WorkShiftAssignmentStatus;
};

export type CreateWorkShiftInput = Pick<
  WorkShift,
  'organizationId' | 'branchId' | 'scheduledStart' | 'scheduledEnd'
>;

export type UpdateWorkShiftInput = Pick<
  WorkShift,
  'organizationId' | 'branchId' | 'id'
> &
  Partial<Pick<WorkShift, 'scheduledStart' | 'scheduledEnd'>>;

export type WorkShiftReference = Pick<
  WorkShift,
  'organizationId' | 'branchId' | 'id'
>;

export type CreateWorkShiftAssignmentInput = WorkShiftReference & {
  employeeId: string;
};

export type UpdateWorkShiftAssignmentStatusInput =
  CreateWorkShiftAssignmentInput & {
    status: Exclude<WorkShiftAssignmentStatus, 'ACTIVE'>;
  };

export type Area = {
  id: string;
  organizationId: string;
  branchId: string;
  code: string;
  displayName: string;
  status: 'ACTIVE' | 'INACTIVE';
};

export type DiningTable = {
  id: string;
  organizationId: string;
  branchId: string;
  areaId: string;
  code: string;
  capacity: number;
  status:
    | 'AVAILABLE'
    | 'OCCUPIED'
    | 'CLEANING'
    | 'RESERVED'
    | 'BLOCKED'
    | 'OUT_OF_SERVICE';
};

export type AreaReference = Pick<Area, 'id' | 'organizationId' | 'branchId'>;

export type CreateAreaInput = Pick<
  Area,
  'organizationId' | 'branchId' | 'code' | 'displayName'
>;

export type UpdateAreaInput = AreaReference & Pick<Area, 'displayName'>;

export type UpdateAreaStatusInput = AreaReference & {
  status: Area['status'];
};

export type DiningTableStatus = DiningTable['status'];

export type DiningTableReference = Pick<
  DiningTable,
  'id' | 'organizationId' | 'branchId'
>;

export type CreateDiningTableInput = Pick<
  DiningTable,
  'organizationId' | 'branchId' | 'areaId' | 'code' | 'capacity'
>;

export type UpdateDiningTableInput = DiningTableReference &
  Partial<Pick<DiningTable, 'areaId' | 'capacity'>>;

export type UpdateDiningTableStatusInput = DiningTableReference & {
  status: Exclude<DiningTableStatus, 'OCCUPIED'>;
};

export type TableSessionStatus = 'OPEN' | 'CLOSED';

export type TableSession = {
  id: string;
  organizationId: string;
  branchId: string;
  tableId: string;
  openedAt: string;
  closedAt: string | null;
  status: TableSessionStatus;
  version: number;
};

export type TableSessionScope = Pick<
  TableSession,
  'organizationId' | 'branchId' | 'tableId'
>;

export type CloseTableSessionInput = TableSessionScope & {
  sessionId: string;
  version: number;
};

export interface AdminRepository {
  branches(organizationId?: string): Promise<Branch[]>;
  createBranch(input: Omit<Branch, 'id'>): Promise<Branch>;
  updateBranch(
    id: string,
    input: Pick<Branch, 'displayName' | 'timeZone'>,
  ): Promise<Branch>;
  employees(organizationId: string): Promise<Employee[]>;
  createEmployee(input: Omit<Employee, 'id'>): Promise<Employee>;
  updateEmployee(
    id: string,
    input: Pick<Employee, 'displayName'>,
  ): Promise<Employee>;
  employeeBranchAssignments(
    organizationId: string,
    employeeId: string,
  ): Promise<EmployeeBranchAssignment[]>;
  assignEmployeeToBranch(
    input: CreateEmployeeBranchAssignmentInput,
  ): Promise<EmployeeBranchAssignment>;
  updateEmployeeBranchAssignmentStatus(
    input: UpdateEmployeeBranchAssignmentStatusInput,
  ): Promise<EmployeeBranchAssignment>;
  workShifts(organizationId: string, branchId: string): Promise<WorkShift[]>;
  createWorkShift(input: CreateWorkShiftInput): Promise<WorkShift>;
  updateWorkShift(input: UpdateWorkShiftInput): Promise<WorkShift>;
  cancelWorkShift(input: WorkShiftReference): Promise<WorkShift>;
  workShiftAssignments(
    organizationId: string,
    branchId: string,
    workShiftId: string,
  ): Promise<WorkShiftAssignment[]>;
  assignEmployeeToWorkShift(
    input: CreateWorkShiftAssignmentInput,
  ): Promise<WorkShiftAssignment>;
  updateWorkShiftAssignmentStatus(
    input: UpdateWorkShiftAssignmentStatusInput,
  ): Promise<WorkShiftAssignment>;
  areas(organizationId: string, branchId: string): Promise<Area[]>;
  createArea(input: CreateAreaInput): Promise<Area>;
  updateArea(input: UpdateAreaInput): Promise<Area>;
  updateAreaStatus(input: UpdateAreaStatusInput): Promise<Area>;
  tables(
    organizationId: string,
    branchId: string,
    areaId?: string,
  ): Promise<DiningTable[]>;
  createTable(input: CreateDiningTableInput): Promise<DiningTable>;
  updateTable(input: UpdateDiningTableInput): Promise<DiningTable>;
  updateTableStatus(
    input: UpdateDiningTableStatusInput,
  ): Promise<DiningTable>;
  tableSessions(
    organizationId: string,
    branchId: string,
    tableId: string,
  ): Promise<TableSession[]>;
  currentTableSession(
    organizationId: string,
    branchId: string,
    tableId: string,
  ): Promise<TableSession | null>;
  openTableSession(input: TableSessionScope): Promise<TableSession>;
  closeTableSession(input: CloseTableSessionInput): Promise<TableSession>;
}

type DemoBranch = Branch & { organizationId: string };

const demoOrganizationId = 'organization-demo';
const employeeCodePattern = /^[a-z0-9][a-z0-9-]{1,63}$/;
const instantPattern =
  /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}(?::\d{2}(?:\.\d{1,3})?)?(?:Z|[+-]\d{2}:\d{2})$/;

function apiError(status: ApiError['status'], message: string): ApiError {
  return { status, message };
}

export class DemoRepository implements AdminRepository {
  private simulationMode: DemoSimulationMode = 'ONLINE';

  private readonly branchRecords: DemoBranch[] = [
    {
      id: 'centro',
      organizationId: demoOrganizationId,
      code: 'centro',
      displayName: 'Centro',
      timeZone: 'America/Mexico_City',
      status: 'ACTIVE',
    },
    {
      id: 'terraza',
      organizationId: demoOrganizationId,
      code: 'terraza',
      displayName: 'Terraza',
      timeZone: 'America/Mexico_City',
      status: 'ACTIVE',
    },
    {
      id: 'external-branch',
      organizationId: 'organization-external',
      code: 'external',
      displayName: 'Sucursal externa',
      timeZone: 'America/Mexico_City',
      status: 'ACTIVE',
    },
  ];

  private readonly employeeRecords: Employee[] = [
    {
      id: 'e1',
      organizationId: demoOrganizationId,
      employeeCode: 'emp-001',
      displayName: 'Ana Morales',
      status: 'ACTIVE',
    },
  ];

  private readonly assignmentRecords: EmployeeBranchAssignment[] = [
    {
      id: 'assignment-e1-centro',
      organizationId: demoOrganizationId,
      employeeId: 'e1',
      branchId: 'centro',
      status: 'ACTIVE',
    },
  ];

  private readonly workShiftRecords: WorkShift[] = [
    {
      id: 'shift-centro-opening',
      organizationId: demoOrganizationId,
      branchId: 'centro',
      scheduledStart: '2026-11-02T14:00:00.000Z',
      scheduledEnd: '2026-11-02T22:00:00.000Z',
      status: 'SCHEDULED',
    },
  ];

  private readonly workShiftAssignmentRecords: WorkShiftAssignment[] = [
    {
      id: 'shift-assignment-e1-opening',
      workShiftId: 'shift-centro-opening',
      employeeId: 'e1',
      organizationId: demoOrganizationId,
      branchId: 'centro',
      status: 'ACTIVE',
    },
  ];

  private readonly areaRecords: Area[] = [
    {
      id: 'area-salon-centro',
      organizationId: demoOrganizationId,
      branchId: 'centro',
      code: 'salon',
      displayName: 'Salón principal',
      status: 'ACTIVE',
    },
    {
      id: 'area-terraza-centro',
      organizationId: demoOrganizationId,
      branchId: 'centro',
      code: 'terraza',
      displayName: 'Terraza',
      status: 'ACTIVE',
    },
    {
      id: 'area-terraza-branch',
      organizationId: demoOrganizationId,
      branchId: 'terraza',
      code: 'exterior',
      displayName: 'Exterior',
      status: 'ACTIVE',
    },
  ];

  private readonly tableRecords: DiningTable[] = [
    {
      id: 'table-centro-01',
      organizationId: demoOrganizationId,
      branchId: 'centro',
      areaId: 'area-salon-centro',
      code: 'm-01',
      capacity: 4,
      status: 'AVAILABLE',
    },
    {
      id: 'table-centro-02',
      organizationId: demoOrganizationId,
      branchId: 'centro',
      areaId: 'area-salon-centro',
      code: 'm-02',
      capacity: 2,
      status: 'CLEANING',
    },
  ];

  private readonly tableSessionRecords: TableSession[] = [
    {
      id: 'session-centro-02-closed',
      organizationId: demoOrganizationId,
      branchId: 'centro',
      tableId: 'table-centro-02',
      openedAt: '2026-11-02T12:00:00.000Z',
      closedAt: '2026-11-02T13:10:00.000Z',
      status: 'CLOSED',
      version: 2,
    },
  ];

  setSimulationMode(mode: DemoSimulationMode): void {
    this.simulationMode = mode;
  }

  async branches(organizationId = demoOrganizationId): Promise<Branch[]> {
    this.assertReadable();
    return this.branchRecords
      .filter((branch) => branch.organizationId === organizationId)
      .map(({ organizationId: _organizationId, ...branch }) => ({ ...branch }));
  }

  async createBranch(input: Omit<Branch, 'id'>): Promise<Branch> {
    this.assertWritable();
    if (
      !employeeCodePattern.test(input.code) ||
      !input.displayName.trim() ||
      !input.timeZone.trim()
    ) {
      throw apiError(400, 'Datos de sucursal inválidos');
    }

    if (
      this.branchRecords.some(
        (branch) =>
          branch.organizationId === demoOrganizationId && branch.code === input.code,
      )
    ) {
      throw apiError(409, 'Código duplicado');
    }

    const branch: DemoBranch = {
      ...input,
      id: crypto.randomUUID(),
      organizationId: demoOrganizationId,
    };
    this.branchRecords.push(branch);
    return this.branchView(branch);
  }

  async updateBranch(
    id: string,
    input: Pick<Branch, 'displayName' | 'timeZone'>,
  ): Promise<Branch> {
    this.assertWritable();
    const branch = this.branchRecords.find(
      (candidate) =>
        candidate.id === id && candidate.organizationId === demoOrganizationId,
    );

    if (!branch) {
      throw apiError(404, 'Sucursal no encontrada');
    }

    if (!input.displayName.trim() || !input.timeZone.trim()) {
      throw apiError(400, 'Datos de sucursal inválidos');
    }

    Object.assign(branch, input);
    return this.branchView(branch);
  }

  async employees(organizationId: string): Promise<Employee[]> {
    this.assertReadable();
    return this.employeeRecords
      .filter((employee) => employee.organizationId === organizationId)
      .map((employee) => ({ ...employee }));
  }

  async createEmployee(input: Omit<Employee, 'id'>): Promise<Employee> {
    this.assertWritable();
    if (
      !employeeCodePattern.test(input.employeeCode) ||
      !input.displayName.trim()
    ) {
      throw apiError(400, 'Datos de empleado inválidos');
    }

    if (
      this.employeeRecords.some(
        (employee) =>
          employee.organizationId === input.organizationId &&
          employee.employeeCode === input.employeeCode,
      )
    ) {
      throw apiError(409, 'Código laboral duplicado');
    }

    const employee: Employee = { ...input, id: crypto.randomUUID() };
    this.employeeRecords.push(employee);
    return { ...employee };
  }

  async updateEmployee(
    id: string,
    input: Pick<Employee, 'displayName'>,
  ): Promise<Employee> {
    this.assertWritable();
    const employee = this.employeeRecords.find((candidate) => candidate.id === id);

    if (!employee) {
      throw apiError(404, 'Empleado no encontrado');
    }

    if (!input.displayName.trim()) {
      throw apiError(400, 'Nombre inválido');
    }

    employee.displayName = input.displayName;
    return { ...employee };
  }

  async employeeBranchAssignments(
    organizationId: string,
    employeeId: string,
  ): Promise<EmployeeBranchAssignment[]> {
    this.assertReadable();
    this.employeeInOrganization(organizationId, employeeId);

    return this.assignmentRecords
      .filter(
        (assignment) =>
          assignment.organizationId === organizationId &&
          assignment.employeeId === employeeId,
      )
      .map((assignment) => ({ ...assignment }));
  }

  async assignEmployeeToBranch(
    input: CreateEmployeeBranchAssignmentInput,
  ): Promise<EmployeeBranchAssignment> {
    this.assertWritable();
    this.activeEmployeeInOrganization(input.organizationId, input.employeeId);
    this.activeBranchInOrganization(input.organizationId, input.branchId);

    const existing = this.assignmentRecords.find(
      (assignment) =>
        assignment.organizationId === input.organizationId &&
        assignment.employeeId === input.employeeId &&
        assignment.branchId === input.branchId,
    );

    if (existing?.status === 'ACTIVE') {
      throw apiError(409, 'El empleado ya está asignado a esta sucursal');
    }

    if (existing) {
      existing.status = 'ACTIVE';
      return { ...existing };
    }

    const assignment: EmployeeBranchAssignment = {
      ...input,
      id: crypto.randomUUID(),
      status: 'ACTIVE',
    };
    this.assignmentRecords.push(assignment);
    return { ...assignment };
  }

  async updateEmployeeBranchAssignmentStatus(
    input: UpdateEmployeeBranchAssignmentStatusInput,
  ): Promise<EmployeeBranchAssignment> {
    this.assertWritable();
    this.employeeInOrganization(input.organizationId, input.employeeId);
    this.branchInOrganization(input.organizationId, input.branchId);

    if (input.status !== 'INACTIVE' && input.status !== 'CANCELED') {
      throw apiError(400, 'Estado de asignación inválido');
    }

    const assignment = this.assignmentRecords.find(
      (candidate) =>
        candidate.organizationId === input.organizationId &&
        candidate.employeeId === input.employeeId &&
        candidate.branchId === input.branchId &&
        candidate.status === 'ACTIVE',
    );

    if (!assignment) {
      throw apiError(404, 'Asignación activa no encontrada');
    }

    assignment.status = input.status;
    return { ...assignment };
  }

  async workShifts(
    organizationId: string,
    branchId: string,
  ): Promise<WorkShift[]> {
    this.assertReadable();
    this.branchInOrganization(organizationId, branchId);

    return this.workShiftRecords
      .filter(
        (shift) =>
          shift.organizationId === organizationId && shift.branchId === branchId,
      )
      .sort((left, right) =>
        left.scheduledStart.localeCompare(right.scheduledStart),
      )
      .map((shift) => ({ ...shift }));
  }

  async createWorkShift(input: CreateWorkShiftInput): Promise<WorkShift> {
    this.assertWritable();
    this.activeBranchInOrganization(input.organizationId, input.branchId);
    this.assertValidShiftPeriod(input.scheduledStart, input.scheduledEnd);

    const shift: WorkShift = {
      ...input,
      id: crypto.randomUUID(),
      status: 'SCHEDULED',
    };
    this.workShiftRecords.push(shift);
    return { ...shift };
  }

  async updateWorkShift(input: UpdateWorkShiftInput): Promise<WorkShift> {
    this.assertWritable();
    this.activeBranchInOrganization(input.organizationId, input.branchId);
    const shift = this.scheduledWorkShift(input);

    if (
      input.scheduledStart === undefined &&
      input.scheduledEnd === undefined
    ) {
      throw apiError(400, 'Debe proporcionar un periodo programado');
    }

    const scheduledStart = input.scheduledStart ?? shift.scheduledStart;
    const scheduledEnd = input.scheduledEnd ?? shift.scheduledEnd;
    this.assertValidShiftPeriod(scheduledStart, scheduledEnd);

    shift.scheduledStart = scheduledStart;
    shift.scheduledEnd = scheduledEnd;
    return { ...shift };
  }

  async cancelWorkShift(input: WorkShiftReference): Promise<WorkShift> {
    this.assertWritable();
    this.activeBranchInOrganization(input.organizationId, input.branchId);
    const shift = this.scheduledWorkShift(input);
    shift.status = 'CANCELED';
    return { ...shift };
  }

  async workShiftAssignments(
    organizationId: string,
    branchId: string,
    workShiftId: string,
  ): Promise<WorkShiftAssignment[]> {
    this.assertReadable();
    this.workShiftInScope({ id: workShiftId, organizationId, branchId });

    return this.workShiftAssignmentRecords
      .filter(
        (assignment) =>
          assignment.organizationId === organizationId &&
          assignment.branchId === branchId &&
          assignment.workShiftId === workShiftId,
      )
      .map((assignment) => ({ ...assignment }));
  }

  async assignEmployeeToWorkShift(
    input: CreateWorkShiftAssignmentInput,
  ): Promise<WorkShiftAssignment> {
    this.assertWritable();
    this.activeBranchInOrganization(input.organizationId, input.branchId);
    this.scheduledWorkShift(input);
    this.activeEmployeeInOrganization(input.organizationId, input.employeeId);
    this.activeEmployeeBranchAssignment(input);

    const existing = this.workShiftAssignmentRecords.find(
      (assignment) =>
        assignment.organizationId === input.organizationId &&
        assignment.branchId === input.branchId &&
        assignment.workShiftId === input.id &&
        assignment.employeeId === input.employeeId,
    );

    if (existing?.status === 'ACTIVE') {
      throw apiError(409, 'El empleado ya está asignado a este turno');
    }

    if (existing) {
      existing.status = 'ACTIVE';
      return { ...existing };
    }

    const assignment: WorkShiftAssignment = {
      id: crypto.randomUUID(),
      workShiftId: input.id,
      employeeId: input.employeeId,
      organizationId: input.organizationId,
      branchId: input.branchId,
      status: 'ACTIVE',
    };
    this.workShiftAssignmentRecords.push(assignment);
    return { ...assignment };
  }

  async updateWorkShiftAssignmentStatus(
    input: UpdateWorkShiftAssignmentStatusInput,
  ): Promise<WorkShiftAssignment> {
    this.assertWritable();
    this.activeBranchInOrganization(input.organizationId, input.branchId);
    this.workShiftInScope(input);

    if (input.status !== 'INACTIVE' && input.status !== 'CANCELED') {
      throw apiError(400, 'Estado de asignación de turno inválido');
    }

    const assignment = this.workShiftAssignmentRecords.find(
      (candidate) =>
        candidate.organizationId === input.organizationId &&
        candidate.branchId === input.branchId &&
        candidate.workShiftId === input.id &&
        candidate.employeeId === input.employeeId &&
        candidate.status === 'ACTIVE',
    );

    if (!assignment) {
      throw apiError(404, 'Asignación activa de turno no encontrada');
    }

    assignment.status = input.status;
    return { ...assignment };
  }

  async areas(organizationId: string, branchId: string): Promise<Area[]> {
    this.assertReadable();
    this.branchInOrganization(organizationId, branchId);

    return this.areaRecords
      .filter(
        (area) =>
          area.organizationId === organizationId && area.branchId === branchId,
      )
      .sort((left, right) => left.code.localeCompare(right.code))
      .map((area) => ({ ...area }));
  }

  async createArea(input: CreateAreaInput): Promise<Area> {
    this.assertWritable();
    this.activeBranchInOrganization(input.organizationId, input.branchId);
    this.assertCodeAndName(input.code, input.displayName, 'área');

    if (
      this.areaRecords.some(
        (area) =>
          area.organizationId === input.organizationId &&
          area.branchId === input.branchId &&
          area.code === input.code,
      )
    ) {
      throw apiError(409, 'Código de área duplicado');
    }

    const area: Area = {
      ...input,
      id: crypto.randomUUID(),
      status: 'ACTIVE',
    };
    this.areaRecords.push(area);
    return { ...area };
  }

  async updateArea(input: UpdateAreaInput): Promise<Area> {
    this.assertWritable();
    this.activeBranchInOrganization(input.organizationId, input.branchId);
    const area = this.areaInScope(input);

    if (!input.displayName.trim() || input.displayName.length > 160) {
      throw apiError(400, 'Nombre de área inválido');
    }

    area.displayName = input.displayName;
    return { ...area };
  }

  async updateAreaStatus(input: UpdateAreaStatusInput): Promise<Area> {
    this.assertWritable();
    this.activeBranchInOrganization(input.organizationId, input.branchId);
    const area = this.areaInScope(input);

    if (input.status === 'INACTIVE') {
      const containsTables = this.tableRecords.some(
        (table) =>
          table.organizationId === input.organizationId &&
          table.branchId === input.branchId &&
          table.areaId === input.id,
      );

      if (containsTables) {
        throw apiError(409, 'No se puede desactivar un área con mesas');
      }
    }

    area.status = input.status;
    return { ...area };
  }

  async tables(
    organizationId: string,
    branchId: string,
    areaId?: string,
  ): Promise<DiningTable[]> {
    this.assertReadable();
    this.branchInOrganization(organizationId, branchId);

    if (areaId) {
      this.areaInScope({ id: areaId, organizationId, branchId });
    }

    return this.tableRecords
      .filter(
        (table) =>
          table.organizationId === organizationId &&
          table.branchId === branchId &&
          (areaId === undefined || table.areaId === areaId),
      )
      .sort((left, right) => left.code.localeCompare(right.code))
      .map((table) => ({ ...table }));
  }

  async createTable(input: CreateDiningTableInput): Promise<DiningTable> {
    this.assertWritable();
    this.activeBranchInOrganization(input.organizationId, input.branchId);
    this.activeAreaInScope({
      id: input.areaId,
      organizationId: input.organizationId,
      branchId: input.branchId,
    });
    this.assertTableInput(input.code, input.capacity);

    if (
      this.tableRecords.some(
        (table) =>
          table.organizationId === input.organizationId &&
          table.branchId === input.branchId &&
          table.code === input.code,
      )
    ) {
      throw apiError(409, 'Código de mesa duplicado');
    }

    const table: DiningTable = {
      ...input,
      id: crypto.randomUUID(),
      status: 'AVAILABLE',
    };
    this.tableRecords.push(table);
    return { ...table };
  }

  async updateTable(input: UpdateDiningTableInput): Promise<DiningTable> {
    this.assertWritable();
    this.activeBranchInOrganization(input.organizationId, input.branchId);
    const table = this.tableInScope(input);

    if (input.areaId !== undefined) {
      this.activeAreaInScope({
        id: input.areaId,
        organizationId: input.organizationId,
        branchId: input.branchId,
      });
      table.areaId = input.areaId;
    }

    if (input.capacity !== undefined) {
      this.assertTableCapacity(input.capacity);
      table.capacity = input.capacity;
    }

    if (input.areaId === undefined && input.capacity === undefined) {
      throw apiError(400, 'Debe proporcionar área o capacidad');
    }

    return { ...table };
  }

  async updateTableStatus(
    input: UpdateDiningTableStatusInput,
  ): Promise<DiningTable> {
    this.assertWritable();
    this.activeBranchInOrganization(input.organizationId, input.branchId);
    const table = this.tableInScope(input);
    const requestedStatus = (input as { status: string }).status;

    if (requestedStatus === 'OCCUPIED') {
      throw apiError(400, 'La ocupación sólo cambia mediante sesiones');
    }

    if (table.status === 'OCCUPIED') {
      throw apiError(409, 'La ocupación sólo cambia mediante sesiones');
    }

    const allowedTransitions: Record<
      Exclude<DiningTableStatus, 'OCCUPIED'>,
      Exclude<DiningTableStatus, 'OCCUPIED'>[]
    > = {
      AVAILABLE: ['CLEANING', 'RESERVED', 'BLOCKED', 'OUT_OF_SERVICE'],
      CLEANING: ['AVAILABLE', 'BLOCKED', 'OUT_OF_SERVICE'],
      RESERVED: ['AVAILABLE', 'BLOCKED', 'OUT_OF_SERVICE'],
      BLOCKED: ['AVAILABLE', 'OUT_OF_SERVICE'],
      OUT_OF_SERVICE: ['AVAILABLE', 'BLOCKED'],
    };

    if (!allowedTransitions[table.status].includes(input.status)) {
      throw apiError(409, 'Transición de mesa no permitida');
    }

    table.status = input.status;
    return { ...table };
  }

  async tableSessions(
    organizationId: string,
    branchId: string,
    tableId: string,
  ): Promise<TableSession[]> {
    this.assertReadable();
    this.tableInScope({ id: tableId, organizationId, branchId });

    return this.tableSessionRecords
      .filter(
        (session) =>
          session.organizationId === organizationId &&
          session.branchId === branchId &&
          session.tableId === tableId,
      )
      .sort((left, right) => right.openedAt.localeCompare(left.openedAt))
      .map((session) => ({ ...session }));
  }

  async currentTableSession(
    organizationId: string,
    branchId: string,
    tableId: string,
  ): Promise<TableSession | null> {
    this.assertReadable();
    this.tableInScope({ id: tableId, organizationId, branchId });

    const session = this.tableSessionRecords.find(
      (candidate) =>
        candidate.organizationId === organizationId &&
        candidate.branchId === branchId &&
        candidate.tableId === tableId &&
        candidate.status === 'OPEN',
    );

    return session ? { ...session } : null;
  }

  async openTableSession(input: TableSessionScope): Promise<TableSession> {
    this.assertWritable();
    this.activeBranchInOrganization(input.organizationId, input.branchId);
    const table = this.tableInScope({
      id: input.tableId,
      organizationId: input.organizationId,
      branchId: input.branchId,
    });

    const current = this.tableSessionRecords.find(
      (session) =>
        session.organizationId === input.organizationId &&
        session.branchId === input.branchId &&
        session.tableId === input.tableId &&
        session.status === 'OPEN',
    );

    if (current) {
      throw apiError(409, 'La mesa ya tiene una sesión abierta');
    }

    if (table.status !== 'AVAILABLE') {
      throw apiError(409, 'La mesa no está disponible');
    }

    const session: TableSession = {
      id: crypto.randomUUID(),
      organizationId: input.organizationId,
      branchId: input.branchId,
      tableId: input.tableId,
      openedAt: new Date().toISOString(),
      closedAt: null,
      status: 'OPEN',
      version: 1,
    };

    this.tableSessionRecords.push(session);
    table.status = 'OCCUPIED';
    return { ...session };
  }

  async closeTableSession(input: CloseTableSessionInput): Promise<TableSession> {
    this.assertWritable();
    this.activeBranchInOrganization(input.organizationId, input.branchId);
    const table = this.tableInScope({
      id: input.tableId,
      organizationId: input.organizationId,
      branchId: input.branchId,
    });
    const session = this.tableSessionRecords.find(
      (candidate) =>
        candidate.id === input.sessionId &&
        candidate.organizationId === input.organizationId &&
        candidate.branchId === input.branchId &&
        candidate.tableId === input.tableId,
    );

    if (!session) {
      throw apiError(404, 'Sesión no encontrada en la mesa');
    }

    if (session.status !== 'OPEN') {
      throw apiError(409, 'La sesión ya no está abierta');
    }

    if (session.version !== input.version) {
      throw apiError(409, 'La versión de la sesión cambió');
    }

    if (table.status !== 'OCCUPIED') {
      throw apiError(409, 'La mesa ya no está ocupada');
    }

    session.status = 'CLOSED';
    session.closedAt = new Date().toISOString();
    session.version += 1;
    table.status = 'CLEANING';

    return { ...session };
  }

  private areaInScope(input: AreaReference): Area {
    const area = this.areaRecords.find(
      (candidate) =>
        candidate.id === input.id &&
        candidate.organizationId === input.organizationId &&
        candidate.branchId === input.branchId,
    );

    if (!area) {
      throw apiError(404, 'Área no encontrada en la sucursal');
    }

    return area;
  }

  private activeAreaInScope(input: AreaReference): Area {
    const area = this.areaInScope(input);

    if (area.status !== 'ACTIVE') {
      throw apiError(409, 'El área debe estar activa');
    }

    return area;
  }

  private tableInScope(input: DiningTableReference): DiningTable {
    const table = this.tableRecords.find(
      (candidate) =>
        candidate.id === input.id &&
        candidate.organizationId === input.organizationId &&
        candidate.branchId === input.branchId,
    );

    if (!table) {
      throw apiError(404, 'Mesa no encontrada en la sucursal');
    }

    return table;
  }

  private assertCodeAndName(code: string, displayName: string, entity: string): void {
    if (
      !employeeCodePattern.test(code) ||
      !displayName.trim() ||
      displayName.length > 160
    ) {
      throw apiError(400, `Datos de ${entity} inválidos`);
    }
  }

  private assertTableInput(code: string, capacity: number): void {
    if (!employeeCodePattern.test(code)) {
      throw apiError(400, 'Código de mesa inválido');
    }

    this.assertTableCapacity(capacity);
  }

  private assertTableCapacity(capacity: number): void {
    if (!Number.isInteger(capacity) || capacity < 1 || capacity > 1000) {
      throw apiError(400, 'Capacidad inválida');
    }
  }

  private employeeInOrganization(
    organizationId: string,
    employeeId: string,
  ): Employee {
    const employee = this.employeeRecords.find(
      (candidate) =>
        candidate.id === employeeId && candidate.organizationId === organizationId,
    );

    if (!employee) {
      throw apiError(404, 'Empleado no encontrado en la organización');
    }

    return employee;
  }

  private activeEmployeeInOrganization(
    organizationId: string,
    employeeId: string,
  ): Employee {
    const employee = this.employeeInOrganization(organizationId, employeeId);

    if (employee.status !== 'ACTIVE') {
      throw apiError(409, 'El empleado no está activo');
    }

    return employee;
  }

  private activeEmployeeBranchAssignment(
    input: CreateWorkShiftAssignmentInput,
  ): EmployeeBranchAssignment {
    const assignment = this.assignmentRecords.find(
      (candidate) =>
        candidate.organizationId === input.organizationId &&
        candidate.branchId === input.branchId &&
        candidate.employeeId === input.employeeId &&
        candidate.status === 'ACTIVE',
    );

    if (!assignment) {
      throw apiError(404, 'El empleado no tiene una asignación activa en la sucursal');
    }

    return assignment;
  }

  private scheduledWorkShift(input: WorkShiftReference): WorkShift {
    const shift = this.workShiftInScope(input);

    if (shift.status !== 'SCHEDULED') {
      throw apiError(409, 'El turno no está programado');
    }

    return shift;
  }

  private workShiftInScope(input: WorkShiftReference): WorkShift {
    const shift = this.workShiftRecords.find(
      (candidate) =>
        candidate.id === input.id &&
        candidate.organizationId === input.organizationId &&
        candidate.branchId === input.branchId,
    );

    if (!shift) {
      throw apiError(404, 'Turno no encontrado en la sucursal');
    }

    return shift;
  }

  private assertValidShiftPeriod(
    scheduledStart: string,
    scheduledEnd: string,
  ): void {
    if (
      !instantPattern.test(scheduledStart) ||
      !instantPattern.test(scheduledEnd)
    ) {
      throw apiError(400, 'Los horarios deben incluir UTC u offset');
    }

    const start = new Date(scheduledStart);
    const end = new Date(scheduledEnd);

    if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) {
      throw apiError(400, 'Los horarios no son válidos');
    }

    if (start >= end) {
      throw apiError(409, 'El fin debe ser posterior al inicio');
    }
  }

  private branchInOrganization(organizationId: string, branchId: string): DemoBranch {
    const branch = this.branchRecords.find(
      (candidate) =>
        candidate.id === branchId && candidate.organizationId === organizationId,
    );

    if (!branch) {
      throw apiError(404, 'Sucursal no encontrada en la organización');
    }

    return branch;
  }

  private activeBranchInOrganization(
    organizationId: string,
    branchId: string,
  ): DemoBranch {
    const branch = this.branchInOrganization(organizationId, branchId);

    if (branch.status !== 'ACTIVE') {
      throw apiError(409, 'La sucursal debe estar activa para asignar personal');
    }

    return branch;
  }

  private branchView({ organizationId: _organizationId, ...branch }: DemoBranch): Branch {
    return { ...branch };
  }

  private assertReadable(): void {
    if (this.simulationMode === 'OFFLINE') {
      throw apiError(0, 'Sin conexión con el repositorio demo');
    }

    if (this.simulationMode === 'READ_ERROR') {
      throw apiError(500, 'Error de lectura simulado');
    }

    if (this.simulationMode === 'SESSION_EXPIRED') {
      throw apiError(401, 'La sesión demo expiró');
    }

    if (this.simulationMode === 'FORBIDDEN') {
      throw apiError(403, 'No tienes permiso para este recurso');
    }
  }

  private assertWritable(): void {
    if (this.simulationMode === 'OFFLINE') {
      throw apiError(0, 'Sin conexión: la operación no fue confirmada');
    }

    if (this.simulationMode === 'MUTATION_REJECTED') {
      throw apiError(409, 'La mutación demo fue rechazada');
    }

    if (this.simulationMode === 'SESSION_EXPIRED') {
      throw apiError(401, 'La sesión demo expiró');
    }

    if (this.simulationMode === 'FORBIDDEN') {
      throw apiError(403, 'No tienes permiso para esta acción');
    }
  }
}

export type HttpTransport = (
  path: string,
  init?: RequestInit,
) => Promise<{ status: number; body: unknown }>;

export class RestRepository implements AdminRepository {
  constructor(
    private readonly http: HttpTransport,
    private readonly enabled = false,
  ) {}

  async branches(organizationId = demoOrganizationId): Promise<Branch[]> {
    return this.get<Branch[]>(`/organizations/${organizationId}/branches`);
  }

  async createBranch(_input: Omit<Branch, 'id'>): Promise<Branch> {
    return this.writeBlocked();
  }

  async updateBranch(
    _id: string,
    _input: Pick<Branch, 'displayName' | 'timeZone'>,
  ): Promise<Branch> {
    return this.writeBlocked();
  }

  async employees(organizationId: string): Promise<Employee[]> {
    return this.get<Employee[]>(`/organizations/${organizationId}/employees`);
  }

  async createEmployee(_input: Omit<Employee, 'id'>): Promise<Employee> {
    return this.writeBlocked();
  }

  async updateEmployee(
    _id: string,
    _input: Pick<Employee, 'displayName'>,
  ): Promise<Employee> {
    return this.writeBlocked();
  }

  async employeeBranchAssignments(
    organizationId: string,
    employeeId: string,
  ): Promise<EmployeeBranchAssignment[]> {
    const branches = await this.branches(organizationId);
    const assignments = await Promise.all(
      branches.map((branch) =>
        this.get<EmployeeBranchAssignment[]>(
          `/organizations/${organizationId}/branches/${branch.id}/employees`,
        ),
      ),
    );

    return assignments
      .flat()
      .filter((assignment) => assignment.employeeId === employeeId);
  }

  async assignEmployeeToBranch(
    _input: CreateEmployeeBranchAssignmentInput,
  ): Promise<EmployeeBranchAssignment> {
    return this.writeBlocked();
  }

  async updateEmployeeBranchAssignmentStatus(
    _input: UpdateEmployeeBranchAssignmentStatusInput,
  ): Promise<EmployeeBranchAssignment> {
    return this.writeBlocked();
  }

  async workShifts(
    organizationId: string,
    branchId: string,
  ): Promise<WorkShift[]> {
    return this.get<WorkShift[]>(
      `/organizations/${organizationId}/branches/${branchId}/work-shifts`,
    );
  }

  async createWorkShift(_input: CreateWorkShiftInput): Promise<WorkShift> {
    return this.writeBlocked();
  }

  async updateWorkShift(_input: UpdateWorkShiftInput): Promise<WorkShift> {
    return this.writeBlocked();
  }

  async cancelWorkShift(_input: WorkShiftReference): Promise<WorkShift> {
    return this.writeBlocked();
  }

  async workShiftAssignments(
    organizationId: string,
    branchId: string,
    workShiftId: string,
  ): Promise<WorkShiftAssignment[]> {
    return this.get<WorkShiftAssignment[]>(
      `/organizations/${organizationId}/branches/${branchId}/work-shifts/${workShiftId}/assignments`,
    );
  }

  async assignEmployeeToWorkShift(
    _input: CreateWorkShiftAssignmentInput,
  ): Promise<WorkShiftAssignment> {
    return this.writeBlocked();
  }

  async updateWorkShiftAssignmentStatus(
    _input: UpdateWorkShiftAssignmentStatusInput,
  ): Promise<WorkShiftAssignment> {
    return this.writeBlocked();
  }

  async areas(organizationId: string, branchId: string): Promise<Area[]> {
    return this.get<Area[]>(
      `/organizations/${organizationId}/branches/${branchId}/areas`,
    );
  }

  async createArea(_input: CreateAreaInput): Promise<Area> {
    return this.writeBlocked();
  }

  async updateArea(_input: UpdateAreaInput): Promise<Area> {
    return this.writeBlocked();
  }

  async updateAreaStatus(_input: UpdateAreaStatusInput): Promise<Area> {
    return this.writeBlocked();
  }

  async tables(
    organizationId: string,
    branchId: string,
    areaId?: string,
  ): Promise<DiningTable[]> {
    const tables = await this.get<DiningTable[]>(
      `/organizations/${organizationId}/branches/${branchId}/tables`,
    );

    return areaId
      ? tables.filter((table) => table.areaId === areaId)
      : tables;
  }

  async createTable(_input: CreateDiningTableInput): Promise<DiningTable> {
    return this.writeBlocked();
  }

  async updateTable(_input: UpdateDiningTableInput): Promise<DiningTable> {
    return this.writeBlocked();
  }

  async updateTableStatus(
    _input: UpdateDiningTableStatusInput,
  ): Promise<DiningTable> {
    return this.writeBlocked();
  }

  async tableSessions(
    organizationId: string,
    branchId: string,
    tableId: string,
  ): Promise<TableSession[]> {
    return this.get<TableSession[]>(
      `/organizations/${organizationId}/branches/${branchId}/tables/${tableId}/sessions`,
    );
  }

  async currentTableSession(
    organizationId: string,
    branchId: string,
    tableId: string,
  ): Promise<TableSession | null> {
    try {
      return await this.get<TableSession>(
        `/organizations/${organizationId}/branches/${branchId}/tables/${tableId}/sessions/current`,
      );
    } catch (caughtError) {
      const apiError = caughtError as Partial<ApiError>;

      if (apiError.status === 404) {
        return null;
      }

      throw caughtError;
    }
  }

  async openTableSession(_input: TableSessionScope): Promise<TableSession> {
    return this.writeBlocked();
  }

  async closeTableSession(
    _input: CloseTableSessionInput,
  ): Promise<TableSession> {
    return this.writeBlocked();
  }

  private async get<T>(path: string): Promise<T> {
    if (!this.enabled) {
      throw apiError(0, 'Modo REST bloqueado');
    }

    const response = await this.http(path);
    if (response.status >= 400) {
      throw apiError(response.status as ApiError['status'], 'Error REST');
    }

    return response.body as T;
  }

  private async writeBlocked<T>(): Promise<T> {
    throw apiError(0, 'Escritura REST bloqueada');
  }
}
