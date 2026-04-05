import {
	type Property,
	PropertyCard,
} from "@/components/properties/property-card";
import { SyncButton } from "@/components/properties/sync-button";
import { requireAuth } from "@/lib/supabase/auth";
import { createClient } from "@/lib/supabase/server";

export default async function PropiedadesPage() {
	await requireAuth();

	const supabase = await createClient();
	const { data: properties } = await supabase
		.from("properties")
		.select("*")
		.order("synced_at", { ascending: false });

	const items = (properties ?? []) as Property[];

	return (
		<div data-testid="propiedades-page">
			{/* Header */}
			<div
				className="mb-8 flex items-center justify-between gap-4"
				data-testid="propiedades-header"
			>
				<div>
					<h1
						className="font-heading text-heading font-bold text-primary"
						data-testid="propiedades-title"
					>
						Propiedades
					</h1>
					{items.length > 0 && (
						<p
							className="mt-1 text-body-sm text-gray-500"
							data-testid="propiedades-count"
						>
							{items.length} {items.length === 1 ? "propiedad" : "propiedades"}
						</p>
					)}
				</div>
				<SyncButton />
			</div>

			{/* Empty state */}
			{items.length === 0 ? (
				<div
					className="flex flex-col items-center justify-center rounded-md border border-gray-200 bg-white px-8 py-16 text-center"
					data-testid="propiedades-empty-state"
				>
					{/* House icon */}
					<svg
						width="40"
						height="40"
						viewBox="0 0 24 24"
						fill="none"
						stroke="currentColor"
						strokeWidth="1.5"
						strokeLinecap="round"
						strokeLinejoin="round"
						className="mb-4 text-gray-300"
						aria-hidden="true"
					>
						<path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
						<polyline points="9 22 9 12 15 12 15 22" />
					</svg>
					<p
						className="text-body font-medium text-primary"
						data-testid="propiedades-empty-title"
					>
						No hay propiedades sincronizadas
					</p>
					<p
						className="mt-1 text-body-sm text-gray-500"
						data-testid="propiedades-empty-description"
					>
						Sincroniza tu CRM para comenzar.
					</p>
				</div>
			) : (
				/* Properties grid */
				<div
					className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
					data-testid="propiedades-grid"
				>
					{items.map((property) => (
						<PropertyCard key={property.id} property={property} />
					))}
				</div>
			)}
		</div>
	);
}
