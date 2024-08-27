import React, { useState } from "react";
import { TodoType } from "../type";
import { useTodos } from "../hooks/useTodos";
import { API_URL } from "@/constants/url";

type TodoProps = {
  todo: TodoType;
};
// 

// 関数型コンポーネント Todo の定義
const Todo = ({ todo }: TodoProps) => {
/* 
解説: { todo }
これは、オブジェクトの分割代入（destructuring assignment）を使っています。
Reactコンポーネントでは、通常 props というオブジェクトでプロパティが渡されますが、
その中から todo というプロパティだけを取り出しています。
これにより、本来はコード1のように記載するところを、コード2のように記載を短縮できます。
  コード1:
    const Todo = (props) => {
      const todo = props.todo;
      // 省略
    };
  コード2:
    const Todo = ({ todo }) => {
      // 省略
    };
*/

  /* useStateと状態変数について
  useStateを学ぶ時に必要となる状態(State)という概念: 
  状態とはコンポーネントのレンダリング間で保持され、変更することで再レンダリングが起きるような値のことを指します。
  言い換えると、状態はコンポーネントがアンマウントされる(使われなくなる)までのライフサイクル間で共有され、
  更新する度にコンポーネントを再計算させるような値です。

  レンダリングとは: 
  レンダリングとはReactが何らかのトリガーを感知した時に対象のコンポーネントに対して呼び出されるイベントです。
  そのイベントでは呼び出した時点でのコンポーネントを計算しどのような画面を表示するかを求め、
  前回の結果と差分があるかを確認するような処理を行います。
  この時、差分があればDOMへ反映しユーザーに伝えます。これをコミットと言います。
  レンダリングという処理自体はDOMへの反映を含んでいないことに注意してください。

  useStateとは: 
  useStateはReactの関数コンポーネントで使われる代表的なAPIの1つ
  useStateはコンポーネント内で状態を扱うための関数の1つです。
  構文: 
    const [state, setState] = useState<State>(initialState);
  引数に初期値initialStateをとり、配列(タプル)で状態値stateと状態を更新するための関数setStateを返します。
  <State>のように状態の型を明示的に指定できます。
  状態stateの更新は更新関数setStateによってのみ行われます。
  実行例: 
    setState(nextState);
  */

  // 編集中ステータスが分かるよう、状態変数を用意、初期値はfalse
  const [isEditing, setIsEditing] = useState<boolean>(false);

  // 編集開始時の元の値が分かるよう、状態変数を用意
  const [editedTitle, setEditedTitle] = useState<string>(todo.title);

  // カスタムフック useTodos の呼び出し
  const { todos, isLoading, error, mutate } = useTodos();

  // 編集ボタン押下時に実行する関数を定義
  const handleEdit = async () => {
    // 状態変数を反転 (true/false)
    setIsEditing(!isEditing);

    // 編集中でない(＝編集完了)である場合、inputの値をDBへ反映
    if (isEditing) {
      const response = await fetch(
        `${API_URL}/editTodo/${todo.id}`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ title: editedTitle }),
        }
      );

      if(response.ok) {
        // タスク編集に成功後、画面をすぐ更新
        const editedTodo = await response.json();

        // useTodosで受け取ったmutateをここで宣言する
        // mutate([...todos, editedTodo]);
        // todosをmap関数で展開する
        const updatedTodos = todos.map( (todo: TodoType) =>
          todo.id === editedTodo.id ? editedTodo : todo
        );
        mutate(updatedTodos);
      }
    }
  };

  // 削除ボタン押下時に実行する関数を定義
  const handleDelete = async (id: number) => {
    const response = await fetch(
      // aa
      `${API_URL}/deleteTodo/${todo.id}`,
      {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
      }
    );
    if (response.ok) {
      const deleteTodo = await response.json();

      // 以下のコードだと、allTodosに、deleteTodoを追加するので、キーの重複でエラーになる？
      // mutate([...todos, deleteTodo]);
      // よって以下のようにコードを修正する
      // 全てのtodoから、配列用filter関数を使用して、削除したtodoを除外
      const updatedTodos = todos.filter((todo: TodoType) => todo.id !== id);
      mutate(updatedTodos);
    }
  }

  const toggleTodoCompletion = async (id: number, isCompleted: boolean) => {
    const response = await fetch(
      `${API_URL}/editTodo/${todo.id}`,
      {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isCompleted: !isCompleted }),
      }
    );
    if (response.ok) {
      const editedTodo = await response.json();
      const updatedTodos = todos.map( (todo: TodoType) =>
        todo.id === editedTodo.id ? editedTodo : todo
      );
      mutate(updatedTodos);
    }
  }

  return (
    <div>
      <li className="py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <input
              id="todo1"
              name="todo1"
              type="checkbox"
              className="h-4 w-4 text-teal-600 focus:ring-teal-500 border-gray-300 rounded"
              onChange={() => toggleTodoCompletion(todo.id, todo.isCompleted)}
            />

            <label className="ml-3 block text-gray-900">

              {/* ポイント
              編集中ステータスが分かるよう。
              三項演算子で記載する。
               - isEdtingがtrueの場合（編集中）: 
               - isEdtingがfalseの場合（編集中でない）: 通常表示
              「todo.title」は親コンポーネントから受け渡された動的な値となる。
              */}

              {isEditing ? (
                <input 
                  type="text"
                  className="border rounded py-1 px-2"
                  value={editedTitle}
                  onChange={(e) => setEditedTitle(e.target.value)}
                />
              ) : (
                <span
                  className={`
                    text-lg font-medium mr-2 
                    ${ todo.isCompleted ? "line-through" : "" }
                  `}
                >
                  {todo.title}
                </span>
              )}

            </label>
          </div>
          <div className="flex items-center space-x-2">

            {/* 編集ボタンを押すと、handleEdit関数が実行 */}
            <button
              onClick={handleEdit}
              className="duration-150 bg-green-600 hover:bg-green-700 text-white font-medium py-1 px-2 rounded"
            >
              {/* 通常時と編集時でボタンのラベルを切り替える、三項演算子で記載する */}
              {isEditing ? "Save" : "✒"}
            </button>

            <button
              onClick={() => handleDelete(todo.id)}
              className="bg-red-500 hover:bg-red-600 text-white font-medium py-1 px-2 rounded"
            >
              ✖
            </button>
          </div>
        </div>
      </li>
    </div>
  );
};

export default Todo;


