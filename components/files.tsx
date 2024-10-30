import axios from "axios";
import { file, listResponse } from "filegilla";
import Loading from "./loading";
import File from "./file";
import { useEffect, useState } from "react";
import { useAuth } from "@/lib/useAuth";

interface props {
  fileName: string | null,
}

const Files: React.FC<props> = ({ fileName }) => {
  const { session } = useAuth();
  const userId = session?.user.id;
  const [files, setFiles] = useState<file[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  const loadFiles = async () => {
    try {
      if (userId) {
        const response = await axios.get(`/api/list/${userId}`);
        const data = response.data as listResponse;

        setFiles(data.files);
        setLoading(false);
      }
    } catch (error) {
      console.log(error);
      setFiles([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (userId) loadFiles();
  }, [userId, fileName]);

  if (loading) {
    return <Loading />;
  }

  if (files.length === 0) {
    return (
      <>
        <h1>Failed to load files.</h1>
      </>
    );
  }

  return (
    <>
      <h1 className="text-lg font-medium">{"Files:"}</h1>
      <div className="flex flex-col gap-2">
        {files && files.map((file, index) => <File key={index} {...file} />)}
      </div>
    </>
  );
};

export default Files;
