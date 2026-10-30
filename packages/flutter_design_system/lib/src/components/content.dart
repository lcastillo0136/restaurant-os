import 'package:flutter/material.dart';

import '../../restaurant_theme.dart';
import 'actions.dart';

class RestaurantCard extends StatelessWidget {
  const RestaurantCard({
    required this.child,
    this.padding = const EdgeInsets.all(24),
    this.selected = false,
    this.onTap,
    this.semanticLabel,
    super.key,
  });
  final Widget child;
  final EdgeInsetsGeometry padding;
  final bool selected;
  final VoidCallback? onTap;
  final String? semanticLabel;

  @override
  Widget build(BuildContext context) {
    final card = Card(
      shape: selected
          ? (Theme.of(context).cardTheme.shape as RoundedRectangleBorder?)
                ?.copyWith(
                  side: BorderSide(
                    color: Theme.of(context).colorScheme.primary,
                    width: 2,
                  ),
                )
          : null,
      child: Padding(padding: padding, child: child),
    );
    if (onTap == null) return card;
    return Semantics(
      button: true,
      selected: selected,
      label: semanticLabel,
      child: InkWell(
        onTap: onTap,
        borderRadius: BorderRadius.circular(RestaurantTokens.radiusLg),
        child: card,
      ),
    );
  }
}

class RestaurantHeader extends StatelessWidget {
  const RestaurantHeader({
    required this.title,
    this.eyebrow,
    this.description,
    this.leading,
    this.trailing,
    super.key,
  });
  final String title;
  final String? eyebrow;
  final String? description;
  final Widget? leading;
  final Widget? trailing;

  @override
  Widget build(BuildContext context) => Row(
    crossAxisAlignment: CrossAxisAlignment.start,
    children: [
      if (leading != null) ...[leading!, const SizedBox(width: 12)],
      Expanded(
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            if (eyebrow != null)
              Text(
                eyebrow!.toUpperCase(),
                style: Theme.of(context).textTheme.labelLarge?.copyWith(
                  color: Theme.of(context).colorScheme.primary,
                  letterSpacing: 1,
                ),
              ),
            Text(title, style: Theme.of(context).textTheme.headlineMedium),
            if (description != null)
              Text(
                description!,
                style: Theme.of(context).textTheme.bodyMedium?.copyWith(
                  color: Theme.of(context)
                      .extension<RestaurantSemanticColors>()
                      ?.textSecondary,
                ),
              ),
          ],
        ),
      ),
      ?trailing,
    ],
  );
}

class MenuCategoryChip extends StatelessWidget {
  const MenuCategoryChip({
    required this.label,
    required this.selected,
    required this.onSelected,
    this.icon,
    super.key,
  });
  final String label;
  final bool selected;
  final ValueChanged<bool> onSelected;
  final IconData? icon;

  @override
  Widget build(BuildContext context) => ConstrainedBox(
    constraints: const BoxConstraints(
      minHeight: RestaurantTokens.minimumTouchTarget,
    ),
    child: FilterChip(
      label: Text(label),
      avatar: icon == null ? null : Icon(icon, size: 18),
      selected: selected,
      onSelected: onSelected,
    ),
  );
}

class ProductCard extends StatelessWidget {
  const ProductCard({
    required this.name,
    required this.description,
    required this.priceLabel,
    required this.onAdd,
    this.image,
    this.available = true,
    super.key,
  });
  final String name;
  final String description;
  final String priceLabel;
  final VoidCallback? onAdd;
  final Widget? image;
  final bool available;

  @override
  Widget build(BuildContext context) => RestaurantCard(
    semanticLabel: '$name, $priceLabel',
    child: LayoutBuilder(
      builder: (context, constraints) {
        final textScale = MediaQuery.textScalerOf(context).scale(1);
        final stacked = constraints.maxWidth < 420 || textScale > 1.5;
        final productImage = SizedBox(
          width: 96,
          height: 96,
          child:
              image ??
              DecoratedBox(
                decoration: BoxDecoration(
                  color: Theme.of(context).colorScheme.primaryContainer,
                  borderRadius: BorderRadius.circular(
                    RestaurantTokens.radiusMd,
                  ),
                ),
                child: const Icon(
                  Icons.restaurant,
                  semanticLabel: 'Ilustración de demostración',
                ),
              ),
        );
        final details = Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(name, style: Theme.of(context).textTheme.titleLarge),
            Text(
              description,
              maxLines: stacked ? null : 2,
              overflow: stacked ? TextOverflow.visible : TextOverflow.ellipsis,
            ),
            const SizedBox(height: 8),
            Text(priceLabel, style: Theme.of(context).textTheme.labelLarge),
          ],
        );
        final action = RestaurantButton(
          label: 'Agregar',
          semanticLabel: 'Agregar $name',
          icon: Icons.add,
          expanded: stacked,
          onPressed: available ? onAdd : null,
        );
        if (stacked) {
          return Column(
            crossAxisAlignment: CrossAxisAlignment.stretch,
            children: [
              Align(alignment: Alignment.centerLeft, child: productImage),
              const SizedBox(height: 16),
              details,
              const SizedBox(height: 16),
              action,
            ],
          );
        }
        return Row(
          children: [
            productImage,
            const SizedBox(width: 16),
            Expanded(child: details),
            const SizedBox(width: 16),
            action,
          ],
        );
      },
    ),
  );
}

class CartSummary extends StatelessWidget {
  const CartSummary({
    required this.itemCount,
    required this.totalLabel,
    required this.onOpen,
    this.pending = false,
    super.key,
  });
  final int itemCount;
  final String totalLabel;
  final VoidCallback? onOpen;
  final bool pending;

  @override
  Widget build(BuildContext context) => Material(
    color: Theme.of(context).colorScheme.surface,
    child: SafeArea(
      top: false,
      child: Padding(
        padding: const EdgeInsets.all(16),
        child: LayoutBuilder(
          builder: (context, constraints) {
            final textScale = MediaQuery.textScalerOf(context).scale(1);
            final stacked = constraints.maxWidth < 420 || textScale > 1.5;
            final summary = Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              mainAxisSize: MainAxisSize.min,
              children: [
                const Text('Carrito local'),
                Text(
                  '$itemCount artículos · $totalLabel',
                  style: Theme.of(context).textTheme.labelLarge,
                ),
              ],
            );
            final action = RestaurantButton(
              label: 'Ver carrito',
              loading: pending,
              expanded: stacked,
              onPressed: onOpen,
            );
            if (stacked) {
              return Column(
                crossAxisAlignment: CrossAxisAlignment.stretch,
                mainAxisSize: MainAxisSize.min,
                children: [summary, const SizedBox(height: 12), action],
              );
            }
            return Row(
              children: [
                Expanded(child: summary),
                const SizedBox(width: 12),
                action,
              ],
            );
          },
        ),
      ),
    ),
  );
}

enum RestaurantTableState { available, active, attention, ready }

class RestaurantTableCard extends StatelessWidget {
  const RestaurantTableCard({
    required this.number,
    required this.state,
    required this.onTap,
    this.detail,
    super.key,
  });
  final String number;
  final RestaurantTableState state;
  final String? detail;
  final VoidCallback onTap;

  @override
  Widget build(BuildContext context) {
    final stateLabel = switch (state) {
      RestaurantTableState.available => 'Disponible',
      RestaurantTableState.active => 'Consumo activo',
      RestaurantTableState.attention => 'Solicita atención',
      RestaurantTableState.ready => 'Pedido listo',
    };
    final color = switch (state) {
      RestaurantTableState.available => Theme.of(context).colorScheme.outline,
      RestaurantTableState.active => Theme.of(context).colorScheme.primary,
      RestaurantTableState.attention => Theme.of(
        context,
      ).extension<RestaurantSemanticColors>()!.warning,
      RestaurantTableState.ready => Theme.of(context).colorScheme.secondary,
    };
    return RestaurantCard(
      onTap: onTap,
      semanticLabel: 'Mesa $number, $stateLabel',
      child: ConstrainedBox(
        constraints: const BoxConstraints(minHeight: 116),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            CircleAvatar(
              backgroundColor: color.withValues(alpha: .12),
              foregroundColor: color,
              child: Text(number),
            ),
            const SizedBox(height: 12),
            Text('Mesa $number', style: Theme.of(context).textTheme.titleLarge),
            Text(stateLabel),
            if (detail != null)
              Text(detail!, style: Theme.of(context).textTheme.bodySmall),
            const SizedBox(height: 8),
            const Align(
              alignment: Alignment.centerRight,
              child: Icon(Icons.chevron_right),
            ),
          ],
        ),
      ),
    );
  }
}

enum AttentionRequestState { newRequest, pendingAck, acknowledged }

class AttentionRequestCard extends StatelessWidget {
  const AttentionRequestCard({
    required this.table,
    required this.message,
    required this.state,
    required this.onAcknowledge,
    super.key,
  });
  final String table;
  final String message;
  final AttentionRequestState state;
  final VoidCallback? onAcknowledge;

  @override
  Widget build(BuildContext context) => RestaurantCard(
    child: Row(
      children: [
        const Icon(
          Icons.notifications_active_outlined,
          semanticLabel: 'Solicitud de atención',
        ),
        const SizedBox(width: 12),
        Expanded(
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(table, style: Theme.of(context).textTheme.titleLarge),
              Text(message),
              Text(switch (state) {
                AttentionRequestState.newRequest => 'Nueva',
                AttentionRequestState.pendingAck => 'Pendiente de ACK',
                AttentionRequestState.acknowledged => 'Confirmada por servidor',
              }),
            ],
          ),
        ),
        RestaurantButton(
          label: 'Atender',
          loading: state == AttentionRequestState.pendingAck,
          onPressed: state == AttentionRequestState.acknowledged
              ? null
              : onAcknowledge,
        ),
      ],
    ),
  );
}

enum OrderVisualState {
  draft,
  pendingAck,
  confirmed,
  preparing,
  ready,
  delivered,
  error,
}

class OrderStatusBadge extends StatelessWidget {
  const OrderStatusBadge({required this.state, super.key});
  final OrderVisualState state;

  @override
  Widget build(BuildContext context) {
    final (label, icon, color) = switch (state) {
      OrderVisualState.draft => (
        'Borrador',
        Icons.edit_outlined,
        Theme.of(context).colorScheme.outline,
      ),
      OrderVisualState.pendingAck => (
        'Pendiente de ACK',
        Icons.sync,
        Theme.of(context).extension<RestaurantSemanticColors>()!.warning,
      ),
      OrderVisualState.confirmed => (
        'Confirmado por servidor',
        Icons.verified_outlined,
        Theme.of(context).colorScheme.secondary,
      ),
      OrderVisualState.preparing => (
        'Preparando',
        Icons.soup_kitchen_outlined,
        Theme.of(context).extension<RestaurantSemanticColors>()!.warning,
      ),
      OrderVisualState.ready => (
        'Listo',
        Icons.check_circle_outline,
        Theme.of(context).colorScheme.secondary,
      ),
      OrderVisualState.delivered => (
        'Entregado',
        Icons.room_service_outlined,
        Theme.of(context).colorScheme.secondary,
      ),
      OrderVisualState.error => (
        'Error',
        Icons.error_outline,
        Theme.of(context).colorScheme.error,
      ),
    };
    return Semantics(
      label: label,
      child: Chip(
        avatar: Icon(icon, color: color, size: 18),
        label: Text(label),
        side: BorderSide(color: color),
      ),
    );
  }
}
