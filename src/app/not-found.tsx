import Button from "@/components/ui/Button";
import GrainMark from "@/components/layout/GrainMark";

export default function NotFound() {
  return (
    <section className="container-x flex min-h-svh flex-col items-start justify-center gap-8 pb-20 pt-32">
      <GrainMark className="h-20 w-20 text-teak" />
      <p className="eyebrow text-teak">404</p>
      <h1 className="font-serif text-display">
        This door <em className="text-teak">leads nowhere.</em>
      </h1>
      <p className="max-w-md text-stone">The page you&rsquo;re looking for has moved or doesn&rsquo;t exist.</p>
      <Button href="/">Back to the entrance</Button>
    </section>
  );
}
