export default function PageTitle({ title }: { title: string }) {
  return (
    <div>
      <h1 className="text-xl mt-4 font-semibold leading-snug tracking-tight">
        {title}
      </h1>
    </div>
  );
}
