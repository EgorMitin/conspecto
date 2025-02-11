import type { MetaFunction } from "@remix-run/node";
import { WEBSITE_DESCRIPTION } from "~/Data";
import Heading from "./heading";
import Heroes from "./heroes";
import Footer from "../../components/Footer";
import Layout from "./layout";

export const meta: MetaFunction = () => {
  return [
    { title: "Conspecto" },
    { name: "description", content: WEBSITE_DESCRIPTION },
  ];
};

export default function Landing() {
  return (
    <Layout>
      <div className="min-h-full flex flex-col">
        <div
          className="flex flex-col items-center justify-center
        md:justify-start text-center gap-y-8 flex-1 px-6 pb-10"
        >
          <Heading />
          <Heroes />
        </div>
        <Footer />
      </div>
    </Layout>
  );
}
