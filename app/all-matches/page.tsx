"use client";
import { useEffect } from "react";
import { useVisualMatchesStore } from "../store";
import { useRouter } from "next/navigation";
import { LeftArrowIcon } from "../components/SvgIcons";
import Link from "next/link";

export default function AllMatches() {
  const router = useRouter();

  const visualMatches = useVisualMatchesStore((state) => state.visualMatches);

  useEffect(() => {
    if (visualMatches.length === 0) {
      router.push("/");
    }
  }, [visualMatches]);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen">
      <Link
        href="/"
        className="rounded-lg w-[120px] h-[30px] flex items-center justify-center mt-5 bg-gray2 hover:bg-gray3 active:bg-gray"
      >
        <LeftArrowIcon />
        <div className="ml-2">Go Back</div>
      </Link>
      <div className="w-screen lg:w-[1000px]">
        {visualMatches.map((visualMatch, i) => (
          <div key={i} className="px-5">
            <Link
              href={visualMatch.link}
              rel="noopener noreferrer"
              target="_blank"
              className="rounded-xl flex p-5 gap-5 h-[150px] mt-5 bg-gray2 hover:bg-gray3 active:bg-gray"
            >
              <img src={visualMatch.thumbnail} className="rounded-xl" />
              <div className="flex flex-col gap-2">
                <div className="overflow-hidden">{visualMatch.title}</div>
                <div>{visualMatch.source}</div>
                <div>
                  Price: {visualMatch.price.currency}
                  {visualMatch.price.extracted_value}
                </div>
              </div>
            </Link>
          </div>
        ))}
      </div>
    </div>
  );
}
