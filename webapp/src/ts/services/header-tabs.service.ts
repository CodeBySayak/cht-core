import { Injectable } from '@angular/core';
import { AuthService } from '@mm-services/auth.service';

const DEFAULT_WEIGHTS: {[key: string]: number} = {
  messages: 1,
  tasks: 2,
  reports: 3,
  contacts: 4,
  analytics: 5,
};
const CUSTOM_WEIGHT = 6;

@Injectable({
  providedIn: 'root'
})
export class HeaderTabsService {
  constructor(
    private authService: AuthService
  ) { }

  private readonly tabs: HeaderTab[] = [
    {
      name: 'messages',
      route: 'messages',
      defaultIcon: 'fa-envelope',
      translation: 'Messages',
      permissions: ['can_view_messages', 'can_view_messages_tab'],
      typeName: 'message',
      icon: undefined,
      resourceIcon: undefined,
      weight: DEFAULT_WEIGHTS.messages,
    },
    {
      name: 'tasks',
      route: 'tasks',
      defaultIcon: 'fa-flag',
      translation: 'Tasks',
      permissions: ['can_view_tasks', 'can_view_tasks_tab'],
      typeName: 'task',
      icon: undefined,
      resourceIcon: undefined,
      weight: DEFAULT_WEIGHTS.tasks,
    },
    {
      name: 'reports',
      route: 'reports',
      defaultIcon: 'fa-list-alt',
      translation: 'Reports',
      permissions: ['can_view_reports', 'can_view_reports_tab'],
      typeName: 'report',
      icon: undefined,
      resourceIcon: undefined,
      weight: DEFAULT_WEIGHTS.reports,
    },
    {
      name: 'contacts',
      route: 'contacts',
      defaultIcon: 'fa-user',
      translation: 'Contacts',
      permissions: ['can_view_contacts', 'can_view_contacts_tab'],
      icon: undefined,
      resourceIcon: undefined,
      weight: DEFAULT_WEIGHTS.contacts,
    },
    {
      name: 'analytics',
      route: 'analytics',
      defaultIcon: 'fa-bar-chart-o',
      translation: 'Analytics',
      permissions: ['can_view_analytics', 'can_view_analytics_tab'],
      icon: undefined,
      resourceIcon: undefined,
      weight: DEFAULT_WEIGHTS.analytics,
    }
  ];

  /**
   * Returns the list of header tabs.
   * If settings are passed as parameter, then it will add the tab.icon and tab.resourceIcon when available.
   *
   * @param settings {Object} Settings of CHT-Core instance.
   *
   * @returns HeaderTab[]
   */
  get(settings?): HeaderTab[] {
    const tabs = this.tabs.map(tab => ({ ...tab }));

    if (settings?.header_tabs) {
      Object.keys(settings.header_tabs).forEach(tabName => {
        let tab = tabs.find(t => t.name === tabName);
        const settingsTab = settings.header_tabs[tabName];

        if (!tab) {
          const name = tabName || settingsTab.id;
          tab = {
            name,
            route: settingsTab.route || name,
            defaultIcon: settingsTab.default_icon || settingsTab.defaultIcon || 'fa-external-link',
            translation: settingsTab.translation || settingsTab.label || name,
            permissions: settingsTab.permissions || [],
            weight: settingsTab.weight || CUSTOM_WEIGHT,
          };
          tabs.push(tab);
        }

        if (settingsTab.icon && settingsTab.icon.startsWith('fa-')) {
          tab.icon = settingsTab.icon;
        }

        if (settingsTab.resource_icon) {
          tab.resourceIcon = settingsTab.resource_icon;
        }

        if (settingsTab.weight !== undefined) {
          tab.weight = settingsTab.weight;
        }
      });
    }

    return tabs.sort((a, b) => {
      const weightA = a.weight ?? CUSTOM_WEIGHT;
      const weightB = b.weight ?? CUSTOM_WEIGHT;

      if (weightA !== weightB) {
        return weightA - weightB;
      }

      return a.translation.localeCompare(b.translation);
    });
  }

  /**
   * Returns the list of authorized header tabs according to the current user's permissions.
   * If settings are passed as parameter, then it will add the tab.icon and tab.resourceIcon when available.
   *
   * @param settings {Object} Settings of CHT-Core instance.
   *
   * @returns Promise<HeaderTab[]>
   */
  async getAuthorizedTabs(settings?): Promise<HeaderTab[]> {
    const tabs = this.get(settings);
    const tabAuthorization = await Promise.all(tabs.map(tab => this.authService.has(tab.permissions)));

    return tabs.filter((tab, index) => tabAuthorization[index]);
  }

  /**
   * Returns the primary tab according to the current user's permissions.
   * If settings are passed as parameter, then it will add the tab.icon and tab.resourceIcon when available.
   *
   * @param settings {Object} Settings of CHT-Core instance.
   *
   * @returns Promise<HeaderTab>
   */
  async getPrimaryTab(settings?): Promise<HeaderTab> {
    const tabs = await this.getAuthorizedTabs(settings);

    return tabs?.[0];
  }
}

export interface HeaderTab {
  name: string;
  route: string;
  defaultIcon: string;
  translation: string;
  permissions: string | string[];
  typeName?: string;
  icon?: string;
  resourceIcon?: string;
  weight?: number;
}
