import 'package:flutter/material.dart';
import 'package:flutter_design_system/restaurant_theme.dart';

void main() {
  runApp(const TableKioskApp());
}

class TableKioskApp extends StatelessWidget {
  const TableKioskApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'Restaurant OS',
      debugShowCheckedModeBanner: false,
      theme: RestaurantTheme.customerWarm(),
      home: const KioskFoundationScreen(),
    );
  }
}

class KioskFoundationScreen extends StatelessWidget {
  const KioskFoundationScreen({super.key});

  @override
  Widget build(BuildContext context) {
    final colors = Theme.of(context).colorScheme;

    return Scaffold(
      body: SafeArea(
        child: LayoutBuilder(
          builder: (context, constraints) {
            final compact = constraints.maxWidth < 620;

            return SingleChildScrollView(
              padding: EdgeInsets.all(compact ? 20 : 32),
              child: Center(
                child: ConstrainedBox(
                  constraints: const BoxConstraints(maxWidth: 980),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Row(
                        children: [
                          Container(
                            width: 42,
                            height: 42,
                            decoration: BoxDecoration(
                              color: colors.primary,
                              borderRadius: BorderRadius.circular(14),
                            ),
                            child: Icon(
                              Icons.restaurant_menu_rounded,
                              color: colors.onPrimary,
                            ),
                          ),
                          const SizedBox(width: 12),
                          Expanded(
                            child: Semantics(
                              label: 'Restaurant OS, experiencia de mesa',
                              child: Text(
                                'Restaurant OS',
                                style: TextStyle(
                                  fontSize: 24,
                                  fontWeight: FontWeight.w700,
                                ),
                              ),
                            ),
                          ),
                          const Chip(
                            avatar: Icon(Icons.language_rounded, size: 17),
                            label: Text('ES'),
                          ),
                        ],
                      ),
                      const SizedBox(height: 32),
                      Container(
                        width: double.infinity,
                        padding: EdgeInsets.all(compact ? 24 : 32),
                        decoration: BoxDecoration(
                          color: colors.surface,
                          borderRadius: BorderRadius.circular(20),
                          border: Border.all(
                            color: RestaurantTheme.tableBorder,
                          ),
                        ),
                        child: Wrap(
                          spacing: 28,
                          runSpacing: 24,
                          crossAxisAlignment: WrapCrossAlignment.center,
                          children: [
                            SizedBox(
                              width: compact ? double.infinity : 460,
                              child: Column(
                                crossAxisAlignment: CrossAxisAlignment.start,
                                children: [
                                  Text(
                                    'Fase 0.1 · muestra de tableta',
                                    style: TextStyle(
                                      color: colors.primary,
                                      fontSize: 13,
                                      fontWeight: FontWeight.w700,
                                      letterSpacing: 0.8,
                                    ),
                                  ),
                                  const SizedBox(height: 12),
                                  Text(
                                    'Una experiencia cálida y directa.',
                                    style: Theme.of(context)
                                        .textTheme
                                        .headlineMedium,
                                  ),
                                  const SizedBox(height: 12),
                                  const Text(
                                    'Muestra estática de tipografía, superficies, categorías y objetivos táctiles. '
                                    'Aún no muestra menú, carrito ni operaciones de consumo.',
                                  ),
                                  const SizedBox(height: 24),
                                  FilledButton.icon(
                                    onPressed: () {},
                                    icon: const Icon(Icons.play_arrow_rounded),
                                    label: const Text(
                                      'Acción principal de muestra',
                                    ),
                                  ),
                                ],
                              ),
                            ),
                            Container(
                              width: compact ? double.infinity : 280,
                              height: 180,
                              decoration: BoxDecoration(
                                color: colors.primaryContainer,
                                borderRadius: BorderRadius.circular(16),
                              ),
                              child: Center(
                                child: Column(
                                  mainAxisSize: MainAxisSize.min,
                                  children: [
                                    Icon(
                                      Icons.image_outlined,
                                      size: 42,
                                      color: colors.primary,
                                    ),
                                    const SizedBox(height: 8),
                                    const Text('Fotografía autorizada futura'),
                                  ],
                                ),
                              ),
                            ),
                          ],
                        ),
                      ),
                      const SizedBox(height: 24),
                      const Text(
                        'Categorías de muestra',
                        style: TextStyle(
                          fontWeight: FontWeight.w700,
                          fontSize: 18,
                        ),
                      ),
                      const SizedBox(height: 12),
                      Wrap(
                        spacing: 12,
                        runSpacing: 12,
                        children: const [
                          _CategorySample(
                            Icons.local_dining_outlined,
                            'Explorar',
                          ),
                          _CategorySample(
                            Icons.emoji_food_beverage_outlined,
                            'Bebidas',
                          ),
                          _CategorySample(
                            Icons.bakery_dining_outlined,
                            'Antojos',
                          ),
                          _CategorySample(
                            Icons.favorite_outline_rounded,
                            'Favoritos futuros',
                          ),
                        ],
                      ),
                      const SizedBox(height: 24),
                      Container(
                        width: double.infinity,
                        padding: const EdgeInsets.all(20),
                        decoration: BoxDecoration(
                          color: colors.surface,
                          borderRadius: BorderRadius.circular(16),
                          border: Border.all(
                            color: RestaurantTheme.tableBorder,
                          ),
                        ),
                        child: Wrap(
                          spacing: 18,
                          runSpacing: 12,
                          crossAxisAlignment: WrapCrossAlignment.center,
                          children: [
                            Icon(
                              Icons.check_circle_outline_rounded,
                              color: colors.primary,
                            ),
                            const Text(
                              'Estado de muestra: información clara, icono y color.',
                              style: TextStyle(fontWeight: FontWeight.w600),
                            ),
                            OutlinedButton.icon(
                              onPressed: () {},
                              icon: const Icon(Icons.help_outline_rounded),
                              label: const Text('Acción secundaria'),
                            ),
                          ],
                        ),
                      ),
                    ],
                  ),
                ),
              ),
            );
          },
        ),
      ),
    );
  }
}

class _CategorySample extends StatelessWidget {
  const _CategorySample(this.icon, this.label);

  final IconData icon;
  final String label;

  @override
  Widget build(BuildContext context) {
    final colors = Theme.of(context).colorScheme;

    return Container(
      width: 152,
      height: 104,
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: colors.surface,
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: RestaurantTheme.tableBorder),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          Icon(icon, color: colors.primary),
          Text(
            label,
            maxLines: 1,
            overflow: TextOverflow.ellipsis,
            style: const TextStyle(fontWeight: FontWeight.w600),
          ),
        ],
      ),
    );
  }
}
