import { relations } from 'drizzle-orm';
import { pgTable, varchar, pgEnum, integer, timestamp, boolean } from 'drizzle-orm/pg-core';

export const nodeTypeEnum = pgEnum('node_type', ['router', 'switch', 'isp']);
export const portStatusEnum = pgEnum('port_status', ['active', 'inactive', 'error']);
export const linkTypeEnum = pgEnum('link_type', ['fiber', 'microwave']);

export const topologies = pgTable('topologies', {
  id: varchar('id', { length: 255 }).primaryKey(),
  name: varchar('name', { length: 255 }).notNull(),
  isActive: boolean('is_active').default(true),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export const nodes = pgTable('nodes', {
  id: varchar('id', { length: 255 }).primaryKey(),
  type: nodeTypeEnum('type').notNull(),
  name: varchar('name', { length: 255 }).notNull(),
  x: integer('x'),
  y: integer('y'),
  topologyId: varchar('topology_id', { length: 255 }).notNull().references(() => topologies.id, { onDelete: 'cascade' }),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export const ports = pgTable('ports', {
  id: varchar('id', { length: 255 }).primaryKey(),
  name: varchar('name', { length: 255 }).notNull(),
  status: portStatusEnum('status').notNull(),
  deviceId: varchar('device_id', { length: 255 }).notNull().references(() => nodes.id, { onDelete: 'cascade' }),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export const links = pgTable('links', {
  id: varchar('id', { length: 255 }).primaryKey(),
  sourceId: varchar('source_id', { length: 255 }).notNull().references(() => ports.id),
  targetId: varchar('target_id', { length: 255 }).notNull().references(() => ports.id),
  type: linkTypeEnum('type').notNull(),
  maxBandwidth: integer('max_bandwidth').notNull(),
  currentBandwidth: integer('current_bandwidth').notNull(),
  value: integer('value').default(1),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export const topologiesRelations = relations(topologies, ({ many }) => ({
  nodes: many(nodes),
}));

export const nodesRelations = relations(nodes, ({ one, many }) => ({
  topology: one(topologies, {
    fields: [nodes.topologyId],
    references: [topologies.id],
  }),
  ports: many(ports),
}));

export const portsRelations = relations(ports, ({ one, many }) => ({
  device: one(nodes, {
    fields: [ports.deviceId],
    references: [nodes.id],
  }),
  sourceLinks: many(links, { relationName: 'sourcePort' }),
  targetLinks: many(links, { relationName: 'targetPort' }),
}));

export const linksRelations = relations(links, ({ one }) => ({
  source: one(ports, {
    fields: [links.sourceId],
    references: [ports.id],
    relationName: 'sourcePort',
  }),
  target: one(ports, {
    fields: [links.targetId],
    references: [ports.id],
    relationName: 'targetPort',
  }),
}));
