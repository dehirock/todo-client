'use client'
/* 
Next.js 13 は、デフォルトでサーバコンポーネントになる
デフォルトはサーバサイドでレンダリングされる
useSWR、useStateなどは、クライアントサイドでしか実行されない
*/

import Image from "next/image";
import Todo from "./components/Todo";
import useSWR from "swr";
import { TodoType } from "./type";
import { useRef } from "react";
import { useTodos } from "./hooks/useTodos";
import { API_URL } from "@/constants/url";

/* ===== ↓ 8/23 hooks/useTodo へ移動 ↓ =====
// クライアント側でのデータフェッチに向けて
async function fetcher(key: string) {
  return fetch(key).then((res) => res.json());
}
// key: エンドポイント(APIのURL)
// then: プロミスチェーンで繋ぐ
// JSON形式で非同期関数で返す
// fetcherは結局のところネイティブの fetch をラップした関数なので、いつもfetchを使うノリでPromiseを返すようにする。
===== ↑ 8/23 hooks/useTodo へ移動 ↑ ===== */

export default function Home() {
  /* ===== ↓ 8/23 hooks/useTodo へ移動 ↓ =====
  // クライアント側でデータをフェッチ
  const { data, isLoading, error, mutate } = useSWR(
    'http://localhost:8080/allTodos', 
    fetcher
  );
  ===== ↑ 8/23 hooks/useTodo へ移動 ↑ ===== */
  
  // カスタムフック useTodos の呼び出し
  const { todos, isLoading, error, mutate } = useTodos();

  /* useSWRの構文
  この例では、useSWR フックは key 文字列と fetcher 関数を受け取ります。
  key はデータの一意な識別子（通常は API の URL）で、fetcher に渡されます。
  fetcher はデータを返す任意の非同期関数で、ネイティブの fetch や Axios のようなツールを使うことができます。
  このフックは、リクエストの状態にもとづいて data と isLoading, error の三つの値を返します。
  */

  // useSWRを使用しない場合、以下のような面倒な記載となる
  // const allTodos = await fetch("API", { cache: "force-cashe"});
  //   no-cache なら SSR
  //   force-cache なら SSG
  // const [todos, setTodos] = useState([]);

  /* useSWRのバウンドミューテート/Bound Mutate
  Mutationとは、日本語で「変化」や「変更」を表す通り、データの更新を行うための仕組みです。
  バウンドミューテートはMutation機能の1つです。
  バウンドミューテートは現在のキーのデータをミューテートする最も簡単な方法です。
  useSWR に渡された key に対して対応付けられ、data を第一引数として受け取ります。
  */

  // フェッチしたデータをデバッグ
  // console.log(todos);

  // const inputRef = useRef(null);
  const inputRef = useRef<HTMLInputElement | null>(null);
  /* 
  useStateを使うと、文字を入力するたびにレンダリングされてしまう。
  useRefにして、ボタンを押したときだけ取得するようにした方が、パフォーマンス的に良い。
  */
  
  // タスク追加ボタン押下時動作用の関数定義
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    /* デバッグ
    if (inputRef.current) {
      console.log(inputRef.current.value);
    }
    */
    
    const response = await fetch(
      `${API_URL}/createTodo`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: inputRef.current?.value,
          isCompleted: false,
        }),
      }
    );
    /* 解説
    JSON.stringify: オブジェクトをJSON形式として認識させてデータを送る。
    JSONは軽量なので、オブジェクトをそのまま渡すより良いらしい。
    */

    if(response.ok) {
      // タスク追加後、画面を更新
      const newTodo = await response.json();
      mutate([...todos, newTodo]);

      // inputを空にする
      if (inputRef.current?.value) {
        inputRef.current.value = "";
      }     
    }
  };

  return (
    // ReactコンポーネントのJSX内では、JavaScriptのコードブロック {} 内で通常のJavaScriptコメント /* */ を使用する。

    // Tailwind CSS という人気ユーティリティファーストCSSフレームワークが提供するクラスを使用し、デザインを向上する。
    // Tailwind CSSのコアクラスは、インストールされたパッケージ内のCSSファイルで定義されている。
    // (node_modules/tailwindcss/tailwind.css)

    // To-Doリスト全体のコンテナ
    <div  className="max-w-md mx-auto bg-white shadow-lg rounded-lg overflow-hidden mt-32 py-4 px-4">
    {/* 適用クラス
      max-w-md: 最大幅がmd（ミディアムサイズ）になるように設定。
      mx-auto: 横方向のマージンを自動で設定し、中央に配置。
      bg-white: 背景を白に設定。
      shadow-lg: 大きな影を付ける。
      rounded-lg: 大きめの角丸を設定。
      overflow-hidden: コンテンツがはみ出ないようにする。
      mt-32: 上方向に32ユニット分のマージンを追加。
      py-4 px-4: 上下左右に4ユニット分のパディングを追加
    */}

      <div className="px-4 py-2">
        {/* To-Doリストのタイトルを表示する部分 */}
        <h1 className="text-gray-800 font-bold text-2xl uppercase">To-Do List</h1>
        {/* 適用クラス
        text-gray-800: 文字色をグレーに設定。
        font-bold: 太字に設定。
        text-2xl: フォントサイズを2xl（Extra Large）に設定。
        uppercase: テキストを全て大文字に変換。
        */}
      </div>

      {/* To-Doの入力フォームを作成する部分 */}
      <form
        className="w-full max-w-sm mx-auto px-4 py-2"
        onSubmit={handleSubmit}
      >
      {/* 適用クラス
      */}
      {/* 解説:
        onSubmit={handle}
      */}


        <div className="flex items-center border-b-2 border-teal-500 py-2">
        {/* 適用クラス
        */}

          {/* タスクを追加するためのinputフィールド */}
          <input 
            className="appearance-none bg-transparent
          border-none w-full text-gray-700 mr-3 py-1 px-2 leading-tight
          focus:outline-none"
            type="text"
            placeholder="Add a task"
            ref={inputRef}
          />
          {/*
          解説: {inputRef}
          この記載で、インプット属性にアクセスできるようになる。
          */}

          {/* タスクを追加するためのボタン */}
          <button
            className="duration-150 flex-shrink-0 bg-blue-500 hover:bg-blue-700 border-blue-500 hover:border-blue-700 text-sm border-4 text-white py-1 px-2 rounded"
            type="submit"
          >
            Add
          </button>

        </div>
      </form>

      {/* タスクのリストを表示する部分 */}
      <ul className="divide-y divide-gray-200 px-4">
        {/* フェッチしたデータを扱う */}
        {todos?.map((todo: TodoType) => (
          <Todo key={todo.id} todo={todo} />
        ) )}
        {/* ポイント: 
        data.map 構文: 
        todo: 別途「client/app/type.ts」で型「TodoType」を定義しておく
        todoの値は「client/app/components/Todo.tsx」に渡される
        dataがundefinedの可能性があるため、オプショナルチェーンで繋ぐ。        
          「data.map」⇒「data?.map」

        オプショナルチェーン:
        data?.map は、JavaScriptのオプショナルチェーン（optional chaining）を使った記法です。
        この記法は、data が null または undefined である場合にエラーを発生させずに安全にアクセスするためのものです。
        オプショナルチェーンは、オブジェクトのプロパティにアクセスする際に、アクセスしようとしているプロパティが存在しない可能性がある場合に使われます。
        たとえば、data が null または undefined である場合、data.map(...) とすると通常はエラーが発生しますが、
        data?.map(...) と書くと、data が null や undefined である場合には undefined を返し、map 関数は実行されません。
        これにより、コードの安全性が向上し、予期しないエラーを防ぐことができます。

        解説: data.map(todo => (...) )
        map は、JavaScriptの配列メソッドで、配列の各要素に対して指定した関数を実行し、新しい配列を返します。
        この場合、data はTodoの配列で、map を使ってそれぞれの todo オブジェクトに対して、特定の処理を行っています。
        このコードでは、data が配列であることを前提に、配列の各要素（todo）に対してReactのコンポーネント Todo を生成しています。
        key={todo.id} で key プロパティを設定しているのは、Reactがリストを効率的にレンダリングするために、各要素に一意のキーを必要とするからです。

        別コンポーネントへのデータ受け渡しについて:
        この部分のコードでは、Todo コンポーネントに todo というプロパティ（prop）を渡しています。
          <Todo key={todo.id} todo={todo} />
        Reactでは、コンポーネント間でデータをやり取りするために「プロパティ（props）」が使われます。
        プロパティは、親コンポーネントから子コンポーネントにデータを渡すための手段です。
        上記のコードでは、todo={todo} として、map で処理している各 todo オブジェクトを Todo コンポーネントに渡しています。
        これにより、Todo コンポーネントは、渡された todo オブジェクトのデータを使って、表示や処理を行うことができます。
        */}
        </ul>
    </div>
  );
}
