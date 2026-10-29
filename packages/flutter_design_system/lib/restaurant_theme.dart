import 'package:flutter/material.dart';

/// Tokens iniciales: sincronizados conceptualmente con design/tokens/.
/// Inter se declara como candidato; Flutter aplicará su fallback hasta integrar
/// una licencia y los assets correspondientes.
class RestaurantTheme {
  static const Color tableBackground = Color(0xFFFAF6F0);
  static const Color tableText = Color(0xFF342C28);
  static const Color tablePrimary = Color(0xFFA6532A);
  static const Color tableSurface = Color(0xFFFFFFFF);
  static const Color tableBorder = Color(0xFFE9DED3);
  static const double minTouchTarget = 48.0;

  static ThemeData customerWarm() {
    return ThemeData(
      useMaterial3: true,
      scaffoldBackgroundColor: tableBackground,
      colorScheme: ColorScheme.fromSeed(
        seedColor: tablePrimary,
        brightness: Brightness.light,
        surface: tableSurface,
      ),
      textTheme: const TextTheme(
        headlineMedium: TextStyle(
          color: tableText,
          fontWeight: FontWeight.w700,
        ),
        bodyMedium: TextStyle(color: tableText, height: 1.5),
      ),
      filledButtonTheme: FilledButtonThemeData(
        style: FilledButton.styleFrom(
          minimumSize: const Size(minTouchTarget, minTouchTarget),
        ),
      ),
      chipTheme: const ChipThemeData(side: BorderSide(color: tableBorder)),
    );
  }
}
