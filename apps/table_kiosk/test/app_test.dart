import 'package:flutter_test/flutter_test.dart';
import 'package:table_kiosk/main.dart';

void main() {
  testWidgets('renders the Phase 0.1 identity shell', (tester) async {
    await tester.pumpWidget(const TableKioskApp());

    expect(find.text('Restaurant OS'), findsOneWidget);
    expect(find.text('Una experiencia cálida y directa.'), findsOneWidget);
    expect(find.textContaining('menú, carrito ni operaciones'), findsOneWidget);
    expect(find.text('Acción principal de muestra'), findsOneWidget);
  });
}
