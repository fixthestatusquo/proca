import { imports } from "../../actionPage";

const Filter = ({ form }) => {
  const filters = Object.entries(imports)
    .filter(([key]) => key.startsWith("filter"))
    .map(([, component]) => component);

  return (
    <>
      {filters.map(Component => (
        <Component key={Component.name} form={form} />
      ))}
    </>
  );
};

export default Filter;
