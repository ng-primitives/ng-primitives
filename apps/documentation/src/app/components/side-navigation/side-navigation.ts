import { NgTemplateOutlet } from '@angular/common';
import { ChangeDetectionStrategy, Component, model } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { NgIcon, provideIcons } from '@ng-icons/core';
import {
  phosphorBookOpenDuotone,
  phosphorLightbulbDuotone,
  phosphorPaletteDuotone,
  phosphorPlugDuotone,
  phosphorRobotDuotone,
  phosphorRocketLaunchDuotone,
} from '@ng-icons/phosphor-icons/duotone';
import { getRouterLinks } from '../../utils/router';

@Component({
  selector: 'docs-side-navigation',
  imports: [RouterLink, RouterLinkActive, NgTemplateOutlet, NgIcon],
  providers: [
    provideIcons({
      phosphorBookOpenDuotone,
      phosphorRocketLaunchDuotone,
      phosphorPaletteDuotone,
      phosphorLightbulbDuotone,
      phosphorRobotDuotone,
      phosphorPlugDuotone,
    }),
  ],
  templateUrl: './side-navigation.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    class: 'md:pe-12',
  },
})
export class SideNavigation {
  readonly menuOpen = model(false);

  readonly sections = Object.entries(getRouterLinks())
    .map(([path, data]) => {
      // the path as we get it starts with '../pages/', so we remove it, and it also ends with '.md', so we remove it
      const normalizedPath = path
        .replace('../pages/', '')
        .replace('.md', '')
        .replace('(documentation)/', '');

      // next split the path up, the first part is the section, the second part is the page
      const [section] = normalizedPath.split('/');

      // normalize the section name, e.g. 'getting-started' -> 'Getting Started'
      const sectionTitle = section
        .split('-')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ');

      return {
        section: sectionTitle,
        link: normalizedPath,
        name: data['name'],
        order: data['order'] ?? Infinity,
        icon: data['icon'],
      };
    })
    // next group the links by section
    .reduce<Section[]>((acc, { section, link, name, order, icon }) => {
      const existingSection = acc.find(s => s.title === section);

      if (existingSection) {
        existingSection.links.push({ link, name, order, icon });

        // sort the links based on the order property if defined
        existingSection.links.sort((a, b) => a.order - b.order);
      } else {
        acc.push({ title: section, links: [{ link, name, order, icon }] });
      }

      return acc;
    }, [])
    // sort so that getting started is always first
    .sort((a, b) => {
      const order = ['Getting Started', 'Primitives', 'Interactions', 'Utilities'];

      // sort based on the order of the section titles
      return order.indexOf(a.title) - order.indexOf(b.title);
    });
}

interface Section {
  title: string;
  links: Link[];
}

interface Link {
  link: string;
  name: string;
  order: number;
  icon?: string;
}
