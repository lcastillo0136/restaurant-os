import 'package:flutter/material.dart';

import 'src/generated/design_tokens.g.dart';

export 'src/generated/design_tokens.g.dart';

@immutable
class RestaurantSemanticColors
    extends ThemeExtension<RestaurantSemanticColors> {
  const RestaurantSemanticColors({
    required this.surfaceElevated,
    required this.textPrimary,
    required this.textSecondary,
    required this.border,
    required this.warning,
    required this.disabled,
  });

  final Color surfaceElevated;
  final Color textPrimary;
  final Color textSecondary;
  final Color border;
  final Color warning;
  final Color disabled;

  @override
  RestaurantSemanticColors copyWith({
    Color? surfaceElevated,
    Color? textPrimary,
    Color? textSecondary,
    Color? border,
    Color? warning,
    Color? disabled,
  }) => RestaurantSemanticColors(
    surfaceElevated: surfaceElevated ?? this.surfaceElevated,
    textPrimary: textPrimary ?? this.textPrimary,
    textSecondary: textSecondary ?? this.textSecondary,
    border: border ?? this.border,
    warning: warning ?? this.warning,
    disabled: disabled ?? this.disabled,
  );

  @override
  RestaurantSemanticColors lerp(
    covariant RestaurantSemanticColors? other,
    double t,
  ) {
    if (other == null) return this;
    return RestaurantSemanticColors(
      surfaceElevated: Color.lerp(surfaceElevated, other.surfaceElevated, t)!,
      textPrimary: Color.lerp(textPrimary, other.textPrimary, t)!,
      textSecondary: Color.lerp(textSecondary, other.textSecondary, t)!,
      border: Color.lerp(border, other.border, t)!,
      warning: Color.lerp(warning, other.warning, t)!,
      disabled: Color.lerp(disabled, other.disabled, t)!,
    );
  }
}

abstract final class RestaurantTheme {
  static const double minTouchTarget = RestaurantTokens.minimumTouchTarget;

  static Color get tableBackground => _customer.background;
  static Color get tableText => _customer.textPrimary;
  static Color get tablePrimary => _customer.accent;
  static Color get tableSurface => _customer.surface;
  static Color get tableBorder => _customer.border;
  static RestaurantColorTokens get _customer =>
      RestaurantTokens.themes[RestaurantThemeName.customerWarm]!;

  static ThemeData adminLight() => forName(RestaurantThemeName.adminLight);
  static ThemeData customerWarm() => forName(RestaurantThemeName.customerWarm);
  static ThemeData kitchenDark() => forName(RestaurantThemeName.kitchenDark);
  static ThemeData posLight() => forName(RestaurantThemeName.posLight);

  static ThemeData forName(RestaurantThemeName name) {
    final tokens = RestaurantTokens.themes[name]!;
    final brightness = name == RestaurantThemeName.kitchenDark
        ? Brightness.dark
        : Brightness.light;
    final scheme =
        (brightness == Brightness.dark
                ? ColorScheme.dark(
                    primary: tokens.accent,
                    onPrimary: tokens.background,
                    surface: tokens.surface,
                    onSurface: tokens.textPrimary,
                    error: tokens.danger,
                    onError: tokens.background,
                  )
                : ColorScheme.light(
                    primary: tokens.accent,
                    onPrimary: tokens.surface,
                    surface: tokens.surface,
                    onSurface: tokens.textPrimary,
                    error: tokens.danger,
                    onError: tokens.surface,
                  ))
            .copyWith(
              secondary: tokens.success,
              outline: tokens.border,
              surfaceContainerHigh: tokens.surfaceElevated,
            );
    final textTheme = TextTheme(
      displaySmall: TextStyle(
        color: tokens.textPrimary,
        fontSize: 48,
        height: 52 / 48,
        fontWeight: FontWeight.w700,
      ),
      headlineMedium: TextStyle(
        color: tokens.textPrimary,
        fontSize: 32,
        height: 40 / 32,
        fontWeight: FontWeight.w700,
      ),
      titleLarge: TextStyle(
        color: tokens.textPrimary,
        fontSize: 24,
        height: 32 / 24,
        fontWeight: FontWeight.w600,
      ),
      bodyLarge: TextStyle(
        color: tokens.textPrimary,
        fontSize: 16,
        height: 1.5,
      ),
      bodyMedium: TextStyle(
        color: tokens.textPrimary,
        fontSize: 16,
        height: 1.5,
      ),
      labelLarge: TextStyle(
        color: tokens.textPrimary,
        fontSize: 14,
        height: 20 / 14,
        fontWeight: FontWeight.w600,
      ),
    );
    final shape = RoundedRectangleBorder(
      borderRadius: BorderRadius.circular(RestaurantTokens.radiusMd),
    );
    return ThemeData(
      useMaterial3: true,
      brightness: brightness,
      scaffoldBackgroundColor: tokens.background,
      colorScheme: scheme,
      textTheme: textTheme,
      extensions: [
        RestaurantSemanticColors(
          surfaceElevated: tokens.surfaceElevated,
          textPrimary: tokens.textPrimary,
          textSecondary: tokens.textSecondary,
          border: tokens.border,
          warning: tokens.warning,
          disabled: tokens.disabled,
        ),
      ],
      filledButtonTheme: FilledButtonThemeData(
        style: FilledButton.styleFrom(
          minimumSize: const Size(
            RestaurantTokens.minimumTouchTarget,
            RestaurantTokens.minimumTouchTarget,
          ),
          shape: shape,
          textStyle: textTheme.labelLarge,
        ),
      ),
      outlinedButtonTheme: OutlinedButtonThemeData(
        style: OutlinedButton.styleFrom(
          minimumSize: const Size(
            RestaurantTokens.minimumTouchTarget,
            RestaurantTokens.minimumTouchTarget,
          ),
          shape: shape,
          textStyle: textTheme.labelLarge,
        ),
      ),
      inputDecorationTheme: InputDecorationTheme(
        filled: true,
        fillColor: tokens.surface,
        constraints: const BoxConstraints(
          minHeight: RestaurantTokens.minimumTouchTarget,
        ),
        border: OutlineInputBorder(
          borderRadius: BorderRadius.circular(RestaurantTokens.radiusMd),
          borderSide: BorderSide(color: tokens.border),
        ),
      ),
      cardTheme: CardThemeData(
        color: tokens.surface,
        elevation: 0,
        margin: EdgeInsets.zero,
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(RestaurantTokens.radiusLg),
          side: BorderSide(color: tokens.border),
        ),
      ),
      chipTheme: ChipThemeData(
        side: BorderSide(color: tokens.border),
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(RestaurantTokens.radiusMd),
        ),
      ),
      progressIndicatorTheme: ProgressIndicatorThemeData(color: tokens.accent),
    );
  }
}
