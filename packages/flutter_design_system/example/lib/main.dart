import 'package:flutter/material.dart';
import 'package:flutter_design_system/flutter_design_system.dart';

void main() {
  runApp(const MainApp());
}

class MainApp extends StatefulWidget {
  const MainApp({super.key});

  @override
  State<MainApp> createState() => _MainAppState();
}

class _MainAppState extends State<MainApp> {
  RestaurantThemeName theme = RestaurantThemeName.customerWarm;
  int navigationIndex = 0;

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      debugShowCheckedModeBanner: false,
      theme: RestaurantTheme.forName(theme),
      home: Scaffold(
        appBar: AppBar(
          title: const Text('Restaurant OS · Componentes'),
          actions: [
            PopupMenuButton<RestaurantThemeName>(
              tooltip: 'Cambiar tema',
              initialValue: theme,
              onSelected: (value) => setState(() => theme = value),
              itemBuilder: (context) => RestaurantThemeName.values
                  .map(
                    (value) =>
                        PopupMenuItem(value: value, child: Text(value.name)),
                  )
                  .toList(growable: false),
            ),
          ],
        ),
        body: const ComponentCatalog(),
        bottomNavigationBar: RestaurantBottomNavigation(
          selectedIndex: navigationIndex,
          onSelected: (value) => setState(() => navigationIndex = value),
          items: const [
            RestaurantNavigationItem(
              label: 'Componentes',
              icon: Icons.widgets_outlined,
            ),
            RestaurantNavigationItem(
              label: 'Estados',
              icon: Icons.layers_outlined,
              badge: 3,
            ),
            RestaurantNavigationItem(
              label: 'Accesibilidad',
              icon: Icons.accessibility_new,
            ),
          ],
        ),
      ),
    );
  }
}

class ComponentCatalog extends StatelessWidget {
  const ComponentCatalog({super.key});

  @override
  Widget build(BuildContext context) => ListView(
    padding: const EdgeInsets.all(20),
    children: [
      const RestaurantHeader(
        eyebrow: 'Fase 0.6 · Android',
        title: 'Catálogo Flutter',
        description: 'Datos ficticios, sin backend ni operaciones reales.',
      ),
      const SizedBox(height: 24),
      CatalogSection(
        title: 'Acciones táctiles',
        child: Wrap(
          spacing: 12,
          runSpacing: 12,
          children: [
            RestaurantButton(label: 'Principal', onPressed: () {}),
            RestaurantButton(
              label: 'Secundaria',
              variant: RestaurantButtonVariant.secondary,
              onPressed: () {},
            ),
            RestaurantButton(
              label: 'Cargando',
              loading: true,
              onPressed: () {},
            ),
            const RestaurantButton(label: 'Deshabilitada', onPressed: null),
          ],
        ),
      ),
      const CatalogSection(
        title: 'Formularios',
        child: Column(
          children: [
            RestaurantTextField(
              label: 'Nombre del producto',
              hint: 'Dato de demostración',
            ),
            SizedBox(height: 16),
            RestaurantTextField(
              label: 'Precio informativo',
              error: 'Ejemplo de validación',
            ),
          ],
        ),
      ),
      CatalogSection(
        title: 'Categorías y producto',
        child: Column(
          children: [
            Wrap(
              spacing: 8,
              runSpacing: 8,
              children: [
                MenuCategoryChip(
                  label: 'Populares',
                  icon: Icons.grid_view,
                  selected: true,
                  onSelected: (_) {},
                ),
                MenuCategoryChip(
                  label: 'Platos',
                  icon: Icons.local_fire_department_outlined,
                  selected: false,
                  onSelected: (_) {},
                ),
                MenuCategoryChip(
                  label: 'Bebidas',
                  icon: Icons.local_drink_outlined,
                  selected: false,
                  onSelected: (_) {},
                ),
              ],
            ),
            const SizedBox(height: 16),
            ProductCard(
              name: 'Tacos de setas',
              description: 'Tortilla de maíz · salsa de la casa',
              priceLabel: '\$99.00 MXN',
              onAdd: () {},
            ),
            const SizedBox(height: 12),
            CartSummary(
              itemCount: 2,
              totalLabel: '\$240.00 MXN',
              onOpen: () {},
            ),
          ],
        ),
      ),
      CatalogSection(
        title: 'Mesas y atención',
        child: Column(
          children: [
            GridView.count(
              shrinkWrap: true,
              physics: const NeverScrollableScrollPhysics(),
              crossAxisCount: 2,
              crossAxisSpacing: 12,
              mainAxisSpacing: 12,
              childAspectRatio: .78,
              children: [
                RestaurantTableCard(
                  number: '02',
                  state: RestaurantTableState.attention,
                  onTap: () {},
                ),
                RestaurantTableCard(
                  number: '04',
                  state: RestaurantTableState.ready,
                  detail: 'Listo para entregar',
                  onTap: () {},
                ),
              ],
            ),
            const SizedBox(height: 16),
            AttentionRequestCard(
              table: 'Mesa 02',
              message: 'Solicita atención',
              state: AttentionRequestState.pendingAck,
              onAcknowledge: () {},
            ),
          ],
        ),
      ),
      const CatalogSection(
        title: 'Estados de pedido',
        child: Wrap(
          spacing: 8,
          runSpacing: 8,
          children: [
            OrderStatusBadge(state: OrderVisualState.draft),
            OrderStatusBadge(state: OrderVisualState.pendingAck),
            OrderStatusBadge(state: OrderVisualState.confirmed),
            OrderStatusBadge(state: OrderVisualState.preparing),
            OrderStatusBadge(state: OrderVisualState.ready),
            OrderStatusBadge(state: OrderVisualState.error),
          ],
        ),
      ),
      CatalogSection(
        title: 'Mensajes y modales',
        child: Column(
          children: [
            const RestaurantAlert(
              title: 'Operación pendiente',
              message: 'Todavía no existe confirmación del servidor.',
              tone: RestaurantAlertTone.warning,
            ),
            const SizedBox(height: 12),
            const RestaurantErrorMessage(
              title: 'Sin conexión',
              message: 'Las mutaciones están bloqueadas.',
            ),
            const SizedBox(height: 12),
            const RestaurantEmptyState(
              title: 'Sin pedidos',
              description: 'No hay pedidos asignados a esta vista.',
            ),
            const RestaurantLoadingIndicator(label: 'Recuperando snapshot'),
            RestaurantButton(
              label: 'Abrir confirmación',
              expanded: true,
              onPressed: () => showRestaurantConfirmationDialog(
                context: context,
                title: 'Confirmar demostración',
                message: 'Este diálogo no ejecuta una operación real.',
              ),
            ),
          ],
        ),
      ),
    ],
  );
}

class CatalogSection extends StatelessWidget {
  const CatalogSection({required this.title, required this.child, super.key});
  final String title;
  final Widget child;

  @override
  Widget build(BuildContext context) => Padding(
    padding: const EdgeInsets.only(bottom: 24),
    child: RestaurantCard(
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(title, style: Theme.of(context).textTheme.titleLarge),
          const SizedBox(height: 16),
          child,
        ],
      ),
    ),
  );
}
