CREATE TYPE "public"."link_type" AS ENUM('fiber', 'microwave');--> statement-breakpoint
CREATE TYPE "public"."node_type" AS ENUM('router', 'switch', 'isp');--> statement-breakpoint
CREATE TYPE "public"."port_status" AS ENUM('active', 'inactive', 'error');--> statement-breakpoint
CREATE TABLE "links" (
	"id" varchar(255) PRIMARY KEY NOT NULL,
	"source_id" varchar(255) NOT NULL,
	"target_id" varchar(255) NOT NULL,
	"type" "link_type" NOT NULL,
	"max_bandwidth" integer NOT NULL,
	"current_bandwidth" integer NOT NULL,
	"value" integer DEFAULT 1,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "nodes" (
	"id" varchar(255) PRIMARY KEY NOT NULL,
	"type" "node_type" NOT NULL,
	"name" varchar(255) NOT NULL,
	"x" integer,
	"y" integer,
	"topology_id" varchar(255) NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "ports" (
	"id" varchar(255) PRIMARY KEY NOT NULL,
	"name" varchar(255) NOT NULL,
	"status" "port_status" NOT NULL,
	"device_id" varchar(255) NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "topologies" (
	"id" varchar(255) PRIMARY KEY NOT NULL,
	"name" varchar(255) NOT NULL,
	"is_active" boolean DEFAULT true,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "links" ADD CONSTRAINT "links_source_id_ports_id_fk" FOREIGN KEY ("source_id") REFERENCES "public"."ports"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "links" ADD CONSTRAINT "links_target_id_ports_id_fk" FOREIGN KEY ("target_id") REFERENCES "public"."ports"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "nodes" ADD CONSTRAINT "nodes_topology_id_topologies_id_fk" FOREIGN KEY ("topology_id") REFERENCES "public"."topologies"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ports" ADD CONSTRAINT "ports_device_id_nodes_id_fk" FOREIGN KEY ("device_id") REFERENCES "public"."nodes"("id") ON DELETE cascade ON UPDATE no action;