import 'package:flutter/material.dart';

class RestaurantNavigationItem {
  const RestaurantNavigationItem({
    required this.label,
    required this.icon,
    this.badge,
  });
  final String label;
  final IconData icon;
  final int? badge;
}

class RestaurantBottomNavigation extends StatelessWidget {
  const RestaurantBottomNavigation({
    required this.items,
    required this.selectedIndex,
    required this.onSelected,
    super.key,
  });
  final List<RestaurantNavigationItem> items;
  final int selectedIndex;
  final ValueChanged<int> onSelected;

  @override
  Widget build(BuildContext context) => NavigationBar(
    selectedIndex: selectedIndex,
    onDestinationSelected: onSelected,
    destinations: items
        .map(
          (item) => NavigationDestination(
            label: item.label,
            icon: Badge(
              isLabelVisible: item.badge != null,
              label: item.badge == null ? null : Text('${item.badge}'),
              child: Icon(item.icon, semanticLabel: item.label),
            ),
          ),
        )
        .toList(growable: false),
  );
}
