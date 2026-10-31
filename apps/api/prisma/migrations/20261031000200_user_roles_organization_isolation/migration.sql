-- Link every role assignment explicitly to its organization.
-- The initial foundation has no user_roles rows, so this is additive and does not transform data.
ALTER TABLE "user_roles" ADD COLUMN "organization_id" UUID NOT NULL;

-- Provide the referenced composite key used to bind branch scope to organization scope.
ALTER TABLE "branches" ADD CONSTRAINT "branches_id_organization_id_key" UNIQUE ("id", "organization_id");

ALTER TABLE "user_roles" ADD CONSTRAINT "user_roles_organization_id_fkey"
  FOREIGN KEY ("organization_id") REFERENCES "organizations"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- A non-null branch_id is checked by the existing scope constraint. For BRANCH scope,
-- this composite FK proves that branch_id belongs to organization_id.
ALTER TABLE "user_roles" ADD CONSTRAINT "user_roles_branch_id_organization_id_fkey"
  FOREIGN KEY ("branch_id", "organization_id") REFERENCES "branches"("id", "organization_id") ON DELETE RESTRICT ON UPDATE CASCADE;

DROP INDEX "user_roles_unique_scope";
CREATE UNIQUE INDEX "user_roles_unique_scope" ON "user_roles"(
  "user_id", "role_id", "organization_id", "scope",
  COALESCE("branch_id", '00000000-0000-0000-0000-000000000000'::uuid)
);
CREATE INDEX "user_roles_organization_id_user_id_branch_id_idx"
  ON "user_roles"("organization_id", "user_id", "branch_id");
