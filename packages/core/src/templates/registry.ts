import type { AnyTemplate, Template } from "./define.js";

/**
 * Template registry. The single integration point between the engine and
 * its consumers: built-ins self-register here, and the studio renders
 * whatever the registry contains. Adding a template touches no other code.
 */

const registry = new Map<string, AnyTemplate>();

export function registerTemplate<TProps extends Record<string, unknown>>(
  template: Template<TProps>,
): Template<TProps> {
  if (registry.has(template.id)) {
    throw new Error(`Template id "${template.id}" is already registered`);
  }
  if (!/^[a-z][a-z0-9-]*$/.test(template.id)) {
    throw new Error(
      `Template id "${template.id}" must be kebab-case (a-z, 0-9, dashes)`,
    );
  }
  registry.set(template.id, template as AnyTemplate);
  return template;
}

export function getTemplate(id: string): AnyTemplate {
  const template = registry.get(id);
  if (!template) {
    const known = [...registry.keys()].join(", ");
    throw new Error(`Unknown template "${id}". Registered: ${known}`);
  }
  return template;
}

export function listTemplates(): readonly AnyTemplate[] {
  return [...registry.values()];
}
