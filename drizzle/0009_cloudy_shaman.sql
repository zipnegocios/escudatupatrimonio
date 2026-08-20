CREATE TABLE "funnel_events" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"session_id" text NOT NULL,
	"screen_id" text NOT NULL,
	"utm_campaign" text,
	"occurred_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "funnel_events_session_id_screen_id_unique" UNIQUE("session_id","screen_id")
);
--> statement-breakpoint
CREATE INDEX "funnel_events_occurred_at_idx" ON "funnel_events" USING btree ("occurred_at");