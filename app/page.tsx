"use client";
import { ChangeEvent, useState, useRef, useCallback, useEffect } from "react";
import { ToastContainer, toast } from "react-toastify";
import { useSession } from "next-auth/react";
import Cookies from "js-cookie";
import {
  UploadIcon,
  LoadingIcon,
  ShowMoreIcon,
  FilterIcon,
} from "./components/SvgIcons";
import "react-toastify/dist/ReactToastify.css";
import FilterModal from "./components/FilterModal";
import { useVisualMatchesStore } from "./store";
import { useRouter } from "next/navigation";
import { currencyMap } from "./utils/currencyMap";
import Link from "next/link";

type Data = {
  [key: string]: {
    visual_matches: Array<{
      title: string;
      link: string;
      source: string;
      price: {
        extracted_value: number;
        currency: string;
      };
      thumbnail: string;
    }>;
  };
};

type VisualMatch = {
  title: string;
  link: string;
  source: string;
  price: {
    extracted_value: number;
    currency: string;
  };
  thumbnail: string;
};

export default function Page() {
  const [showMore, setShowMore] = useState<{ [key: string]: boolean }>({});
  const [dragging, setDragging] = useState(false);
  const [loading, setLoading] = useState(false);
  const [country, setCountry] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const dropRef = useRef(null);
  const { data: session } = useSession();

  const {
    data,
    setData,
    url,
    setUrl,
    imageFile,
    setImageFile,
    setVisualMatches,
    reset,
  } = useVisualMatchesStore();
  const router = useRouter();

  useEffect(() => {
    const storedCountry = Cookies.get("country");
    if (storedCountry) {
      setCountry(storedCountry);
    }
  }, []);

  const handleSubmit = useCallback(async () => {
    if (!session) {
      toast.info("Not logged in. Expect a delay of 10 seconds.");
    }

    setLoading(true);

    const formData = new FormData();
    if (url) {
      formData.append("url", url);
    } else if (imageFile) {
      const base64Image = imageFile.split(",")[1];
      formData.append("image", base64Image);
    }
    if (country) {
      formData.append("country", country);
    }

    try {
      const response = await fetch("/api/segment", {
        method: "POST",
        body: formData,
      });

      const result: { error?: string } & Data = await response.json();

      if (result.error) {
        toast.error(result.error);
        setData(null);
      } else {
        const filteredData: Data = {};
        const currency = country ? currencyMap[country] : null;
        for (const key in result) {
          filteredData[key] = {
            visual_matches: result[key].visual_matches.filter(
              (match) =>
                match.price && (!currency || match.price.currency === currency)
            ),
          };
        }

        setData(filteredData);
      }
    } catch (e) {
      toast.error("Client side error.");
    } finally {
      setLoading(false);
    }
  }, [url, imageFile, country]);

  const handleUrlChange = (event: ChangeEvent<HTMLInputElement>) => {
    setUrl(event.target.value);
  };

  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files ? event.target.files[0] : null;
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImageFile(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleDragOver = (event: React.DragEvent) => {
    event.preventDefault();
    setDragging(true);
  };

  const handleDragLeave = (event: React.DragEvent) => {
    event.preventDefault();
    setDragging(false);
  };

  const handleDrop = (event: React.DragEvent) => {
    event.preventDefault();
    setDragging(false);
    const file = event.dataTransfer.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImageFile(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleApplyFilters = () => {
    if (country) {
      Cookies.set("country", country);
    }
    handleSubmit();
    setData(null);
  };

  const handleShowAll = (matches: VisualMatch[]) => {
    setVisualMatches(matches);
    router.push("/all-matches");
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen">
      <ToastContainer position="top-center" />
      <div className="w-screen sm:w-[500px] h-[500px] px-5 pt-5">
        <form
          onSubmit={(event) => {
            event.preventDefault();
            handleSubmit();
          }}
          className="flex flex-col w-full h-full items-center justify-center gap-5 rounded-2xl border-2 border-dashed border-white bg-gray2"
          ref={dropRef}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
        >
          {url ? (
            <img
              src={url}
              className={`object-contain w-full h-full ${
                loading || !data ? "opacity-20" : "opacity-100"
              }`}
            />
          ) : (
            imageFile && (
              <img
                src={imageFile}
                className={`object-contain w-full h-full ${
                  loading || !data ? "opacity-20" : "opacity-100"
                }`}
              />
            )
          )}
          {!url && !imageFile && (
            <>
              <UploadIcon />
              <div className="flex">
                <div>Drag & Drop or</div>
                <input
                  type="file"
                  id="file-input"
                  className="hidden"
                  onChange={handleFileChange}
                />
                <label
                  htmlFor="file-input"
                  className="cursor-pointer text-yellow ml-1 hover:text-yellow2 active:text-yellow3"
                >
                  Choose File
                </label>
              </div>
              <div>OR</div>
              <input
                type="text"
                value={url}
                onChange={handleUrlChange}
                placeholder="Paste URL"
                className="border bg-gray border-white text-white placeholder-white w-[300px] pl-2"
              />
            </>
          )}
          {(url || imageFile) && !data && (
            <div className="absolute bg-gray2 size-[150px] flex flex-col items-center justify-center rounded-xl">
              {loading ? (
                <LoadingIcon />
              ) : (
                !data && (
                  <button
                    type="submit"
                    className="rounded-lg w-[100px] h-[30px] flex items-center justify-center text-black bg-yellow hover:bg-yellow2 active:bg-yellow3"
                  >
                    Submit
                  </button>
                )
              )}
            </div>
          )}
        </form>
      </div>
      {data && (
        <div className="w-screen lg:w-[1000px] flex justify-between px-5 pt-5">
          <button
            onClick={reset}
            className="rounded-lg w-[100px] h-[30px] flex items-center justify-center bg-red hover:bg-red2 active:bg-red3"
          >
            Reset
          </button>
          <button
            onClick={() => setIsModalOpen(true)}
            className="rounded-lg w-[100px] h-[30px] flex items-center justify-center bg-gray2 hover:bg-gray3 active:bg-gray"
          >
            <div>Filters</div>
            <div className="ml-2">
              <FilterIcon />
            </div>
          </button>
        </div>
      )}
      <div className="w-screen lg:w-[1000px]">
        {data &&
          Object.keys(data).map((key) => {
            let prioritizedMatches = data[key].visual_matches.filter(
              (match) =>
                match.source.toLowerCase().includes("amazon") ||
                match.source.toLowerCase().includes("ebay") ||
                match.source.toLowerCase().includes("walmart") ||
                match.source.toLowerCase().includes("aliexpress")
            );

            let otherMatches = data[key].visual_matches.filter(
              (match) =>
                !match.source.toLowerCase().includes("amazon") &&
                !match.source.toLowerCase().includes("ebay") &&
                !match.source.toLowerCase().includes("walmart") &&
                !match.source.toLowerCase().includes("aliexpress")
            );

            const visualMatches = [...prioritizedMatches, ...otherMatches];

            const matchesToShow = showMore[key]
              ? visualMatches.slice(0, 5)
              : visualMatches.slice(0, 1);

            return (
              <div key={key}>
                {matchesToShow.map((visualMatch, i) => (
                  <div key={i} className="px-5">
                    <Link
                      href={visualMatch.link}
                      rel="noopener noreferrer"
                      target="_blank"
                      className="rounded-xl flex p-5 gap-5 h-[150px] mt-5 bg-gray2 hover:bg-gray3 active:bg-gray"
                    >
                      <img src={visualMatch.thumbnail} className="rounded-xl" />
                      <div className="flex flex-col gap-2">
                        <div className="overflow-hidden">
                          {visualMatch.title}
                        </div>
                        <div>{visualMatch.source}</div>
                        <div>
                          Price: {visualMatch.price.currency}
                          {visualMatch.price.extracted_value}
                        </div>
                      </div>
                    </Link>
                  </div>
                ))}
                {visualMatches.length > 1 && (
                  <div className="h-[30px] flex flex-col items-center justify-center">
                    <button
                      onClick={() =>
                        setShowMore({ ...showMore, [key]: !showMore[key] })
                      }
                      className="rounded-lg w-[100px] h-[30px] flex items-center justify-center text-black bg-yellow hover:bg-yellow2 active:bg-yellow3"
                    >
                      <ShowMoreIcon expanded={showMore[key]} />
                    </button>
                  </div>
                )}
                {showMore[key] && visualMatches.length > 5 && (
                  <div className="mt-2 h-[30px] flex flex-col items-center justify-center">
                    <button
                      onClick={() => handleShowAll(visualMatches)}
                      className="rounded-lg w-[100px] h-[30px] flex items-center justify-center text-black bg-yellow hover:bg-yellow2 active:bg-yellow3"
                    >
                      Show All
                    </button>
                  </div>
                )}
              </div>
            );
          })}
      </div>
      {isModalOpen && (
        <FilterModal
          onClose={() => setIsModalOpen(false)}
          setCountry={setCountry}
          onApplyFilters={handleApplyFilters}
        />
      )}
    </div>
  );
}
