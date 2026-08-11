import { INSURANCE_PARTNERS } from "@/presentation/constants";

// copy: spec de rediseño v1.0 § 2.2 Barra de autoridad
export function AuthorityBar() {
  return (
    <div className="flex flex-col gap-4">
      <p className="type-body text-center">
        Respaldado por aseguradoras con más de 100 años de solidez en el mercado
      </p>
      <div className="flex flex-wrap items-center justify-center gap-x-8 gap-y-4">
        {INSURANCE_PARTNERS.map((partner) => (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            key={partner.name}
            src={partner.logoUrl}
            alt={partner.name}
            className="h-8 w-auto grayscale opacity-70 hover:grayscale-0 hover:opacity-100 transition-[filter,opacity] duration-300"
            loading="lazy"
          />
        ))}
      </div>
    </div>
  );
}
