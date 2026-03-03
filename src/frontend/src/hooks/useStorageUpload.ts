import { HttpAgent } from "@icp-sdk/core/agent";
import { useCallback, useState } from "react";
import { StorageClient } from "../utils/StorageClient";
import { useInternetIdentity } from "./useInternetIdentity";

// Caffeine platform config helpers
const CANISTER_ID =
  (window as any).__CANISTER_ID__ ||
  import.meta.env.VITE_BACKEND_CANISTER_ID ||
  "";
const STORAGE_GATEWAY_URL =
  (window as any).__STORAGE_GATEWAY_URL__ ||
  import.meta.env.VITE_STORAGE_GATEWAY_URL ||
  "https://storage.caffeine.ai";
const PROJECT_ID =
  (window as any).__PROJECT_ID__ || import.meta.env.VITE_PROJECT_ID || "";
const BUCKET_NAME = "hall-photos";

export interface UploadResult {
  hash: string;
  url?: string;
}

export function useStorageUpload() {
  const { identity } = useInternetIdentity();
  const [isUploading, setIsUploading] = useState(false);
  const [progress, setProgress] = useState(0);

  const uploadFile = useCallback(
    async (file: File): Promise<UploadResult> => {
      setIsUploading(true);
      setProgress(0);
      try {
        const agent = await HttpAgent.create({
          identity: identity ?? undefined,
          host: "https://ic0.app",
        });

        const storageClient = new StorageClient(
          BUCKET_NAME,
          STORAGE_GATEWAY_URL,
          CANISTER_ID,
          PROJECT_ID,
          agent,
        );

        const bytes = new Uint8Array(await file.arrayBuffer());
        const result = await storageClient.putFile(bytes, (pct) =>
          setProgress(pct),
        );
        const url = await storageClient.getDirectURL(result.hash);
        return { hash: result.hash, url };
      } finally {
        setIsUploading(false);
        setProgress(100);
      }
    },
    [identity],
  );

  const getFileUrl = useCallback(
    async (hash: string): Promise<string> => {
      const agent = await HttpAgent.create({
        identity: identity ?? undefined,
        host: "https://ic0.app",
      });
      const storageClient = new StorageClient(
        BUCKET_NAME,
        STORAGE_GATEWAY_URL,
        CANISTER_ID,
        PROJECT_ID,
        agent,
      );
      return storageClient.getDirectURL(hash);
    },
    [identity],
  );

  return { uploadFile, getFileUrl, isUploading, progress };
}
