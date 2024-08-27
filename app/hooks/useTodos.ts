import { API_URL } from "@/constants/url";
import useSWR from "swr";

// クライアント側でのデータフェッチに向けて
async function fetcher(key: string) {
  return fetch(key).then((res) => res.json());
}

// カスタムフック useTodos をここで作成する
// カスタムフックにより、グローバル状態を管理できる

export const useTodos = () => {
  const { data, isLoading, error, mutate } = useSWR(
    `${API_URL}/allTodos`, 
    fetcher
  );

  // カスタムフックなのでリターンで返してあげれば良い
  // オブジェクト型で返す
  return {
      todos: data,
      isLoading,
      error,
      mutate,
  };
};
