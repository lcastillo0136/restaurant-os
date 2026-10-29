import 'package:flutter/material.dart';

import '../../restaurant_theme.dart';

enum RestaurantButtonVariant { primary, secondary, danger, ghost }

class RestaurantButton extends StatelessWidget {
  const RestaurantButton({
    required this.label,
    required this.onPressed,
    this.variant = RestaurantButtonVariant.primary,
    this.icon,
    this.loading = false,
    this.expanded = false,
    this.semanticLabel,
    super.key,
  });

  final String label;
  final VoidCallback? onPressed;
  final RestaurantButtonVariant variant;
  final IconData? icon;
  final bool loading;
  final bool expanded;
  final String? semanticLabel;

  @override
  Widget build(BuildContext context) {
    final content = loading
        ? const SizedBox.square(
            dimension: 20,
            child: CircularProgressIndicator(strokeWidth: 2),
          )
        : Row(
            mainAxisSize: MainAxisSize.min,
            children: [
              if (icon != null) ...[
                Icon(icon, size: 20),
                const SizedBox(width: 8),
              ],
              Text(label),
            ],
          );
    final callback = loading ? null : onPressed;
    final button = switch (variant) {
      RestaurantButtonVariant.primary => FilledButton(
        onPressed: callback,
        child: content,
      ),
      RestaurantButtonVariant.secondary => OutlinedButton(
        onPressed: callback,
        child: content,
      ),
      RestaurantButtonVariant.danger => FilledButton(
        onPressed: callback,
        style: FilledButton.styleFrom(
          backgroundColor: Theme.of(context).colorScheme.error,
          foregroundColor: Theme.of(context).colorScheme.onError,
        ),
        child: content,
      ),
      RestaurantButtonVariant.ghost => TextButton(
        onPressed: callback,
        child: content,
      ),
    };
    return Semantics(
      container: true,
      button: true,
      label: semanticLabel ?? label,
      enabled: callback != null,
      value: loading ? 'Cargando' : null,
      child: ExcludeSemantics(
        child: ConstrainedBox(
          constraints: const BoxConstraints(
            minHeight: RestaurantTokens.minimumTouchTarget,
            minWidth: RestaurantTokens.minimumTouchTarget,
          ),
          child: expanded
              ? SizedBox(width: double.infinity, child: button)
              : button,
        ),
      ),
    );
  }
}

class RestaurantTextField extends StatelessWidget {
  const RestaurantTextField({
    required this.label,
    this.controller,
    this.hint,
    this.error,
    this.enabled = true,
    this.keyboardType,
    this.onChanged,
    super.key,
  });

  final String label;
  final TextEditingController? controller;
  final String? hint;
  final String? error;
  final bool enabled;
  final TextInputType? keyboardType;
  final ValueChanged<String>? onChanged;

  @override
  Widget build(BuildContext context) => Semantics(
    textField: true,
    label: label,
    enabled: enabled,
    child: TextField(
      controller: controller,
      enabled: enabled,
      keyboardType: keyboardType,
      onChanged: onChanged,
      decoration: InputDecoration(
        labelText: label,
        hintText: hint,
        errorText: error,
      ),
    ),
  );
}
