import React from 'react';
import CodeMirror from "@uiw/react-codemirror";
import { andromedaInit } from '@uiw/codemirror-theme-andromeda';
import { javascript } from '@codemirror/lang-javascript';
import { html } from '@codemirror/lang-html';
import { Spin } from '@douyinfe/semi-ui';

const CodeEditor = ({
  code,
  onChange,
  isLoading,
  loadingTip = "AI正在生成注释..."
}) => {
  return (
    <Spin
      spinning={isLoading}
      tip={loadingTip}
      style={{
        height: '100%',
        alignItems: 'center',
        justifyContent: 'center'
      }}
    >
      <div style={{ height: '60vh' }}>
        <CodeMirror
          value={code}
          theme={andromedaInit({
            settings: {
              caret: '#c6c6c6',
              fontFamily: 'monospace',
              fontSize: '18px',
            }
          })}
          extensions={[javascript({ jsx: true }), html()]}
          options={{
            mode: "jsx",
            matchBrackets: true,
            tabSize: 2,
          }}
          onChange={onChange}
          style={{ flex: 1, boxSizing: "border-box" }}
          maxHeight='60vh'
          height="60vh"
        />
      </div>
    </Spin>
  );
};

export default CodeEditor; 