CREATE TABLE "leads" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"session_id" text NOT NULL,
	"nombre" text,
	"telefono" text,
	"canal" text,
	"priority" text,
	"status" text DEFAULT 'NEW' NOT NULL,
	"utm_campaign" text,
	"source" text DEFAULT 'smart-form' NOT NULL,
	"ghl_contact_id" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "leads_session_id_unique" UNIQUE("session_id")
);
--> statement-breakpoint
CREATE TABLE "qualification_profiles" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"lead_id" uuid NOT NULL,
	"intencion_p" text,
	"intencion_s" text,
	"horizonte" text,
	"plan_retiro" text,
	"familia_tipo" text,
	"preoc_familia" text,
	"cob_actual" text,
	"preoc_salud" text,
	"edad_rango" text,
	"edad_cond" boolean DEFAULT false NOT NULL,
	"salud" text,
	"salud_flag" text,
	"estatus" text,
	"estatus_flag" text,
	"estado" text,
	"timezone" text,
	"referido" boolean DEFAULT false NOT NULL,
	"ventana_disp" text,
	"tags" text[] DEFAULT '{}' NOT NULL,
	"raw_profile" jsonb NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "qualification_profiles_lead_id_unique" UNIQUE("lead_id")
);
--> statement-breakpoint
ALTER TABLE "qualification_profiles" ADD CONSTRAINT "qualification_profiles_lead_id_leads_id_fk" FOREIGN KEY ("lead_id") REFERENCES "public"."leads"("id") ON DELETE cascade ON UPDATE no action;