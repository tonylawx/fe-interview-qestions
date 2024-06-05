# TypeScript 中的自定义 Hooks 用于共享状态和撤销/重做

## 创建共享状态的 Context

首先，我们创建一个 Context 来共享状态。

```typescript
// stateContext.ts
import { createContext, useContext } from 'react';

interface State {
  items: string[];
  history: string[][];
  undoStack: string[][];
  redoStack: string[][];
}

interface Dispatch {
  (type: 'ADD_ITEM', payload: string): void;
  (type: 'UNDO'): void;
  (type: 'REDO'): void;
}

const StateContext = createContext<{ state: State; dispatch: Dispatch }>({
  state: {
    items: [],
    history: [],
    undoStack: [],
    redoStack: [],
  },
  dispatch: () => {},
});

export const useSharedState = () => useContext(StateContext);

export const StateProvider = ({ children }: { children?: React.ReactNode }) => {
  const [state, dispatch] = useReducer(reducer, initialState);

  return <StateContext.Provider value={{ state, dispatch }}>{children}</StateContext.Provider>;
};
```

## 创建自定义 Hooks

自定义 Hooks 将使用 `useReducer` 来管理状态，并提供撤销/重做功能。

```typescript
// useSharedReducer.ts
import { useReducer, useEffect } from 'react';
import { StateContext } from './stateContext';

const initialState: State = {
  items: [],
  history: [],
  undoStack: [],
  redoStack: [],
};

const reducer = (state: State, action: { type: string; payload?: string }): State => {
  switch (action.type) {
    case 'ADD_ITEM':
      return {
        ...state,
        items: [...state.items, action.payload!],
        history: [...state.history, [...state.items]],
        undoStack: [...state.undoStack, state],
      };
    // 添加其他 action 处理逻辑
    case 'UNDO':
      // 实现撤销逻辑
      // ...
    case 'REDO':
      // 实现重做逻辑
      // ...
    default:
      return state;
  }
};

const useSharedReducer = (): { state: State; dispatch: Dispatch } => {
  const [state, dispatch] = useReducer(reducer, initialState);

  const undo = () => {
    dispatch({ type: 'UNDO' });
  };

  const redo = () => {
    dispatch({ type: 'REDO' });
  };

  return { state, dispatch, undo, redo };
};

export default useSharedReducer;
```

## 在父组件中使用 StateProvider

将 `StateProvider` 组件包裹在你的应用或特定的组件树中，以提供共享状态。

```typescript
// App.tsx
import { StateProvider } from './stateContext';

const App: React.FC = () => (
  <StateProvider>
    {/* 所有子组件都可以访问共享状态 */}
    <ChildComponent />
    <AnotherChildComponent />
    {/* ...其他组件 */}
  </StateProvider>
);

export default App;
```

## 在子组件中使用自定义 Hooks

子组件可以通过 `useSharedState` Hook 访问共享状态。

```typescript
// ChildComponent.tsx
import { useSharedState } from './stateContext';

const ChildComponent: React.FC = () => {
  const { state, dispatch, undo, redo } = useSharedState();

  // 使用 state 和 dispatch 更新状态
  // ...

  return (
    <div>
      <button onClick={() => dispatch({ type: 'ADD_ITEM', payload: 'New Item' })}>Add Item</button>
      <button onClick={undo}>Undo</button>
      <button onClick={redo}>Redo</button>
      {/* 渲染共享状态 */}
      {state.items.map((item) => <div key={item}>{item}</div>)}
    </div>
  );
};

export default ChildComponent;
```

这样，你就可以在所有子组件之间共享状态，并实现撤销/重做功能。自定义 Hooks `useSharedReducer` 封装了状态管理的逻辑，使得在任何子组件中都可以轻松地访问和操作共享状态。
```

请注意，这个示例假设你已经定义了 `initialState` 和 `reducer` 函数，并且它们是类型安全的。在实际应用中，你可能需要根据你的应用需求调整状态结构和操作类型。此外，撤销/重做逻辑的实现细节在这里被省略了，你需要根据你的具体需求来填充这部分逻辑。