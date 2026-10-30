import 'package:flutter/material.dart';

import '../../restaurant_theme.dart';
import 'actions.dart';

enum RestaurantAlertTone { neutral, success, warning, danger }

class RestaurantAlert extends StatelessWidget {
  const RestaurantAlert({
    required this.title,
    required this.message,
    this.tone = RestaurantAlertTone.neutral,
    this.action,
    super.key,
  });
  final String title;
  final String message;
  final RestaurantAlertTone tone;
  final Widget? action;

  @override
  Widget build(BuildContext context) {
    final color = switch (tone) {
      RestaurantAlertTone.neutral => Theme.of(context).colorScheme.primary,
      RestaurantAlertTone.success => Theme.of(context).colorScheme.secondary,
      RestaurantAlertTone.warning => Theme.of(
        context,
      ).extension<RestaurantSemanticColors>()!.warning,
      RestaurantAlertTone.danger => Theme.of(context).colorScheme.error,
    };
    final icon = switch (tone) {
      RestaurantAlertTone.neutral => Icons.info_outline,
      RestaurantAlertTone.success => Icons.check_circle_outline,
      RestaurantAlertTone.warning => Icons.warning_amber,
      RestaurantAlertTone.danger => Icons.error_outline,
    };
    return Semantics(
      container: true,
      liveRegion: true,
      label: '$title. $message',
      child: ExcludeSemantics(
        child: Container(
          padding: const EdgeInsets.all(16),
          decoration: BoxDecoration(
            color: color.withValues(alpha: .1),
            border: Border.all(color: color),
            borderRadius: BorderRadius.circular(RestaurantTokens.radiusMd),
          ),
          child: Row(
            children: [
              Icon(icon, color: color),
              const SizedBox(width: 12),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(title, style: Theme.of(context).textTheme.labelLarge),
                    Text(message),
                  ],
                ),
              ),
              ?action,
            ],
          ),
        ),
      ),
    );
  }
}

class RestaurantEmptyState extends StatelessWidget {
  const RestaurantEmptyState({
    required this.title,
    required this.description,
    this.icon = Icons.inbox_outlined,
    this.action,
    super.key,
  });
  final String title;
  final String description;
  final IconData icon;
  final Widget? action;
  @override
  Widget build(BuildContext context) => Semantics(
    label: '$title. $description',
    child: Padding(
      padding: const EdgeInsets.all(40),
      child: Column(
        mainAxisSize: MainAxisSize.min,
        children: [
          Icon(
            icon,
            size: 48,
            color: Theme.of(context).colorScheme.primary,
            semanticLabel: title,
          ),
          const SizedBox(height: 16),
          Text(title, style: Theme.of(context).textTheme.titleLarge),
          const SizedBox(height: 8),
          Text(description, textAlign: TextAlign.center),
          if (action != null) ...[const SizedBox(height: 20), action!],
        ],
      ),
    ),
  );
}

class RestaurantErrorMessage extends StatelessWidget {
  const RestaurantErrorMessage({
    required this.title,
    required this.message,
    this.onRetry,
    super.key,
  });
  final String title;
  final String message;
  final VoidCallback? onRetry;
  @override
  Widget build(BuildContext context) => RestaurantAlert(
    title: title,
    message: message,
    tone: RestaurantAlertTone.danger,
    action: onRetry == null
        ? null
        : RestaurantButton(
            label: 'Reintentar',
            variant: RestaurantButtonVariant.secondary,
            onPressed: onRetry,
          ),
  );
}

class RestaurantLoadingIndicator extends StatelessWidget {
  const RestaurantLoadingIndicator({this.label = 'Cargando', super.key});
  final String label;
  @override
  Widget build(BuildContext context) => Semantics(
    liveRegion: true,
    label: label,
    child: Padding(
      padding: const EdgeInsets.all(24),
      child: Column(
        mainAxisSize: MainAxisSize.min,
        children: [
          const CircularProgressIndicator(),
          const SizedBox(height: 12),
          Text(label),
        ],
      ),
    ),
  );
}

Future<bool?> showRestaurantConfirmationDialog({
  required BuildContext context,
  required String title,
  required String message,
  String confirmLabel = 'Confirmar',
  String cancelLabel = 'Cancelar',
  bool destructive = false,
}) => showDialog<bool>(
  context: context,
  builder: (context) => AlertDialog(
    title: Text(title),
    content: Text(message),
    actions: [
      RestaurantButton(
        label: cancelLabel,
        variant: RestaurantButtonVariant.secondary,
        onPressed: () => Navigator.of(context).pop(false),
      ),
      RestaurantButton(
        label: confirmLabel,
        variant: destructive
            ? RestaurantButtonVariant.danger
            : RestaurantButtonVariant.primary,
        onPressed: () => Navigator.of(context).pop(true),
      ),
    ],
  ),
);
