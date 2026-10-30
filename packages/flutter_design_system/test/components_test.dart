import 'package:flutter/material.dart';
import 'package:flutter_design_system/flutter_design_system.dart';
import 'package:flutter_test/flutter_test.dart';

void main() {
  Widget host(
    Widget child, {
    RestaurantThemeName theme = RestaurantThemeName.customerWarm,
    TextScaler textScaler = TextScaler.noScaling,
  }) => MaterialApp(
    theme: RestaurantTheme.forName(theme),
    builder: (context, child) => MediaQuery(
      data: MediaQuery.of(context).copyWith(textScaler: textScaler),
      child: child!,
    ),
    home: Scaffold(body: child),
  );

  Future<void> setViewport(
    WidgetTester tester, {
    required Size size,
  }) async {
    tester.view.devicePixelRatio = 1;
    tester.view.physicalSize = size;
    addTearDown(tester.view.resetPhysicalSize);
    addTearDown(tester.view.resetDevicePixelRatio);
  }

  test('four token themes create coherent ThemeData', () {
    for (final name in RestaurantThemeName.values) {
      final theme = RestaurantTheme.forName(name);
      final tokens = RestaurantTokens.themes[name]!;
      expect(theme.scaffoldBackgroundColor, tokens.background);
      expect(theme.colorScheme.primary, tokens.accent);
      expect(theme.colorScheme.surface, tokens.surface);
      expect(
        theme.extension<RestaurantSemanticColors>()?.border,
        tokens.border,
      );
    }
  });

  testWidgets('touch button is at least 48 dp and exposes semantics', (
    tester,
  ) async {
    var taps = 0;
    await tester.pumpWidget(
      host(RestaurantButton(label: 'Continuar', onPressed: () => taps++)),
    );
    final button = find.bySemanticsLabel('Continuar');
    expect(button, findsOneWidget);
    expect(
      tester.getSize(find.byType(FilledButton)).height,
      greaterThanOrEqualTo(48),
    );
    await tester.tap(find.byType(FilledButton));
    expect(taps, 1);
  });

  testWidgets('loading button blocks interactions and announces loading', (
    tester,
  ) async {
    var taps = 0;
    await tester.pumpWidget(
      host(
        RestaurantButton(
          label: 'Enviar',
          loading: true,
          onPressed: () => taps++,
        ),
      ),
    );
    expect(find.text('Enviar'), findsNothing);
    expect(find.byType(CircularProgressIndicator), findsOneWidget);
    await tester.tap(find.byType(FilledButton));
    expect(taps, 0);
  });

  testWidgets('text field reports validation and supports keyboard focus', (
    tester,
  ) async {
    await tester.pumpWidget(
      host(
        const Padding(
          padding: EdgeInsets.all(16),
          child: RestaurantTextField(label: 'Nombre', error: 'Campo requerido'),
        ),
      ),
    );
    expect(find.text('Campo requerido'), findsOneWidget);
    await tester.tap(find.byType(TextField));
    await tester.enterText(find.byType(TextField), 'a');
    expect(find.text('a'), findsOneWidget);
  });

  testWidgets('table card has text semantics and explicit callback', (
    tester,
  ) async {
    var selected = false;
    await tester.pumpWidget(
      host(
        RestaurantTableCard(
          number: '04',
          state: RestaurantTableState.ready,
          detail: 'Listo para entregar',
          onTap: () => selected = true,
        ),
      ),
    );
    expect(find.bySemanticsLabel('Mesa 04, Pedido listo'), findsOneWidget);
    await tester.tap(find.text('Mesa 04'));
    expect(selected, isTrue);
  });

  testWidgets('order pending ACK is textually distinguishable', (tester) async {
    await tester.pumpWidget(
      host(const OrderStatusBadge(state: OrderVisualState.pendingAck)),
    );
    expect(find.text('Pendiente de ACK'), findsOneWidget);
  });

  testWidgets('offline/error state uses an accessible live message', (
    tester,
  ) async {
    await tester.pumpWidget(
      host(
        const RestaurantErrorMessage(
          title: 'Sin conexión',
          message: 'Las mutaciones están bloqueadas.',
        ),
      ),
    );
    expect(
      find.bySemanticsLabel('Sin conexión. Las mutaciones están bloqueadas.'),
      findsOneWidget,
    );
  });

  testWidgets('product card reflows at 320 dp with 200 percent text', (
    tester,
  ) async {
    await setViewport(tester, size: const Size(320, 800));
    await tester.pumpWidget(
      host(
        SingleChildScrollView(
          child: ProductCard(
            name: 'Tacos de setas de temporada',
            description:
                'Descripción suficientemente larga para comprobar el ajuste.',
            priceLabel: r'$198.00 MXN',
            onAdd: () {},
          ),
        ),
        textScaler: const TextScaler.linear(2),
      ),
    );
    expect(tester.takeException(), isNull);
    expect(find.text('Tacos de setas de temporada'), findsOneWidget);
    expect(find.text('Agregar'), findsOneWidget);
    expect(
      tester.getSize(find.byType(FilledButton)).height,
      greaterThanOrEqualTo(48),
    );
  });

  testWidgets('cart summary reflows at 320 dp with 200 percent text', (
    tester,
  ) async {
    await setViewport(tester, size: const Size(320, 640));
    await tester.pumpWidget(
      host(
        CartSummary(
          itemCount: 12,
          totalLabel: r'$1,248.00 MXN',
          onOpen: () {},
        ),
        textScaler: const TextScaler.linear(2),
      ),
    );
    expect(tester.takeException(), isNull);
    expect(find.text(r'12 artículos · $1,248.00 MXN'), findsOneWidget);
    expect(find.text('Ver carrito'), findsOneWidget);
    expect(
      tester.getSize(find.byType(FilledButton)).height,
      greaterThanOrEqualTo(48),
    );
  });

  testWidgets('product and cart retain horizontal-capable layout at 600 dp', (
    tester,
  ) async {
    await setViewport(tester, size: const Size(600, 900));
    await tester.pumpWidget(
      host(
        ListView(
          children: [
            ProductCard(
              name: 'Producto adaptable',
              description: 'Detalle completo',
              priceLabel: r'$99.00 MXN',
              onAdd: () {},
            ),
            CartSummary(
              itemCount: 1,
              totalLabel: r'$99.00 MXN',
              onOpen: () {},
            ),
          ],
        ),
      ),
    );
    expect(tester.takeException(), isNull);
    expect(find.text('Agregar'), findsOneWidget);
    expect(find.text('Ver carrito'), findsOneWidget);
  });
}
