// GENERATED from design/tokens/*.json by scripts/generate-design-tokens.mjs.
// Do not edit values here; change only the canonical JSON after approval.

import 'package:flutter/material.dart';

enum RestaurantThemeName { adminLight, customerWarm, kitchenDark, posLight }

@immutable
class RestaurantColorTokens {
  const RestaurantColorTokens({
    required this.background,
    required this.surface,
    required this.surfaceElevated,
    required this.textPrimary,
    required this.textSecondary,
    required this.border,
    required this.accent,
    required this.success,
    required this.warning,
    required this.danger,
    required this.disabled,
  });

  final Color background;
  final Color surface;
  final Color surfaceElevated;
  final Color textPrimary;
  final Color textSecondary;
  final Color border;
  final Color accent;
  final Color success;
  final Color warning;
  final Color danger;
  final Color disabled;
}

abstract final class RestaurantTokens {
  static const double minimumTouchTarget = 48.0;
  static const double focusWidth = 3.0;
  static const double focusOffset = 2.0;
  static const double space0 = 0.0;
  static const double space1 = 4.0;
  static const double space2 = 8.0;
  static const double space3 = 12.0;
  static const double space4 = 16.0;
  static const double space5 = 20.0;
  static const double space6 = 24.0;
  static const double space8 = 32.0;
  static const double space10 = 40.0;
  static const double space12 = 48.0;
  static const double radiusSm = 8.0;
  static const double radiusMd = 12.0;
  static const double radiusLg = 16.0;
  static const double radiusXl = 20.0;
  static const double radiusPill = 999.0;
  static const Duration durationInstant = Duration(milliseconds: 0);
  static const Duration durationShort = Duration(milliseconds: 120);
  static const Duration durationMedium = Duration(milliseconds: 200);

  static const Map<RestaurantThemeName, RestaurantColorTokens> themes = {
    RestaurantThemeName.adminLight: RestaurantColorTokens(
      background: Color(0xFFF5F6F8),
      surface: Color(0xFFFFFFFF),
      surfaceElevated: Color(0xFFFFFFFF),
      textPrimary: Color(0xFF171D29),
      textSecondary: Color(0xFF5F6673),
      border: Color(0xFFDDE1E7),
      accent: Color(0xFFA6532A),
      success: Color(0xFF39805D),
      warning: Color(0xFFB7791F),
      danger: Color(0xFFC43C35),
      disabled: Color(0xFFA3A9B3),
    ),
    RestaurantThemeName.customerWarm: RestaurantColorTokens(
      background: Color(0xFFFAF6F0),
      surface: Color(0xFFFFFFFF),
      surfaceElevated: Color(0xFFFFF9F2),
      textPrimary: Color(0xFF342C28),
      textSecondary: Color(0xFF6E625C),
      border: Color(0xFFE9DED3),
      accent: Color(0xFFA6532A),
      success: Color(0xFF39805D),
      warning: Color(0xFFB7791F),
      danger: Color(0xFFC43C35),
      disabled: Color(0xFFABA09A),
    ),
    RestaurantThemeName.kitchenDark: RestaurantColorTokens(
      background: Color(0xFF101820),
      surface: Color(0xFF202D36),
      surfaceElevated: Color(0xFF2A3A46),
      textPrimary: Color(0xFFFFFFFF),
      textSecondary: Color(0xFFC6D1D8),
      border: Color(0xFF3A4C59),
      accent: Color(0xFF40BDA7),
      success: Color(0xFF63C174),
      warning: Color(0xFFE9B44C),
      danger: Color(0xFFEF6461),
      disabled: Color(0xFF71808B),
    ),
    RestaurantThemeName.posLight: RestaurantColorTokens(
      background: Color(0xFFF5F6F8),
      surface: Color(0xFFFFFFFF),
      surfaceElevated: Color(0xFFF9FAFC),
      textPrimary: Color(0xFF171D29),
      textSecondary: Color(0xFF5F6673),
      border: Color(0xFFDDE1E7),
      accent: Color(0xFF5A26E8),
      success: Color(0xFF39805D),
      warning: Color(0xFFB7791F),
      danger: Color(0xFFC43C35),
      disabled: Color(0xFFA3A9B3),
    ),
  };
}
