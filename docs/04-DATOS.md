# Modelo de dominio mínimo
- Organization(id,name); Branch(id,organization_id,timezone,currency,status)
- User(id,username,password_hash,status); Employee(id,user_id); Role; Permission; RoleAssignment(branch_id,...)
- Area(id,branch_id,name); DiningTable(id,branch_id,area_id,code,capacity,status,device_id); TableSession(id,table_id,opened_at,closed_at,status,version)
- SessionGuest(id,table_session_id,customer_id nullable,alias)
- Category(id,branch_id,name); Product(id,branch_id,category_id,price,is_available); ModifierGroup; Modifier; ProductModifier
- Order(id,branch_id,table_session_id,client_request_id,status,total); OrderItem(id,order_id,session_guest_id nullable,name_snapshot,price_snapshot,tax_snapshot,quantity,status)
- KitchenStation; KitchenTicket; KitchenTicketItem; KitchenEvent
- CashRegister; CashShift; CashMovement; Payment; PaymentAllocation; Tip; Receipt; AuditEvent; Device
- Preparar futuro: Customer, CustomerCredential, Favorite, InvoiceRequest, FiscalDocument, ProviderTransaction.

## Constraints
Un solo TableSession abierto por table_id (índice parcial); único client_request_id por scope; un CashShift abierto por cash_register_id; prohibido imputar pago mayor que saldo salvo cambio de efectivo explícito; cada evento de anulaciones queda auditado; multi-sucursal en autorización y consultas.

## Estados por entidad
Mesa: available/occupied/cleaning/reserved/blocked/out_of_service.
Pedido: draft/confirmed/in_preparation/partial_ready/ready/delivered/closed/canceled (estado agregado derivado de ítems cuando aplique).
Pago: initiated/pending/confirmed/failed/refunded/voided.
Nunca usar estados visuales como sustituto de estado transaccional persistido.
