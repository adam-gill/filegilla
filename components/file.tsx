import { file } from "filegilla";
import Link from "next/link";
import {
  GrDocumentImage,
  GrDocumentPdf,
  GrDocumentWord,
  GrDocumentVideo,
  GrDocumentZip,
  GrDocumentText,
} from "react-icons/gr";
import { BsThreeDotsVertical } from "react-icons/bs";

const File = ({ name, sizeInBytes, lastModified, blobUrl, md5hash }: file) => {
  const convertSize = (size: number) => {
    const sizes = ["Bytes", "KB", "MB", "GB", "TB"];

    if (size === 0) return "0 Byte";

    const i = Math.floor(Math.log(size) / Math.log(1024));
    return Math.round(size / Math.pow(1024, i)) + " " + sizes[i];
  };

  const cleanName = (name: string): string => {
    const dashIndex = name.indexOf("-");
    let cleaned = dashIndex !== -1 ? name.slice(dashIndex + 1) : name;

    if (cleaned.length > 15) {
      cleaned = cleaned.slice(0, 14) + "...";
    }

    return cleaned;
  };

  const cleanDate = (dateString: string): string => {
    const date = new Date(dateString);
    const options: Intl.DateTimeFormatOptions = {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    };

    return date.toLocaleDateString(undefined, options);
  };

  const fileIcons = (name: string) => {
    const lastPeriodIndex = name.lastIndexOf(".");
    if (lastPeriodIndex === -1) return <GrDocumentText />;

    const fileExtension = name.slice(lastPeriodIndex + 1);

    if (fileExtension === "pdf") {
      return <GrDocumentPdf />;
    } else if (fileExtension === "doc" || fileExtension === "docx") {
      return <GrDocumentWord />;
    } else if (
      fileExtension === "png" ||
      fileExtension === "jpg" ||
      fileExtension === "jpeg"
    ) {
      return <GrDocumentImage />;
    } else if (
      fileExtension === "mov" ||
      fileExtension === "mp4" ||
      fileExtension == "webm"
    ) {
      return <GrDocumentVideo />;
    } else if (
      fileExtension === "zip" ||
      fileExtension === "xz" ||
      fileExtension === "gz"
    ) {
      return <GrDocumentZip />;
    } else {
      return <GrDocumentText />;
    }
  };

  return (
    <>
      <div
        className="flex relative flex-col w-full max-w-[350px] border-2 border-white rounded-lg p-2 cc"
        data-md5={md5hash}
      >
        <div className="absolute top-2 left-2">{fileIcons(name)}</div>
        <div className="cursor-pointer absolute top-2 right-2 bg-transparent rounded-full p-1 hover:bg-[#a0a0a06f] transition-all duration-300">
          <BsThreeDotsVertical />
        </div>
        <Link href={blobUrl} className="flex flex-col cc">
          <p>{cleanName(name)}</p>
          <p>{convertSize(sizeInBytes)}</p>
          <p>{cleanDate(lastModified)}</p>
        </Link>
      </div>
    </>
  );
};

export default File;
