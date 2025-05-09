import React, { useCallback } from 'react';
import { ErrorBoundary } from "react-error-boundary";
import { evalCode } from "../utils/codeEvaluator";

const Preview = ({ code, onError, onSuccess }) => {
  const [previewState, setPreviewState] = React.useState({
    result: null,
    error: null
  });

  const evaluateCode = useCallback(() => {
    try {
      const { result, error } = evalCode(code);
      setPreviewState({ result, error });
      if (error) {
        onError?.(error.message);
      } else if (result) {
        onSuccess?.();
      }
    } catch (e) {
      const errorMessage = e.message || 'Unknown error';
      setPreviewState({ result: null, error: e });
      onError?.(errorMessage);
    }
  }, [code, onError, onSuccess]);

  React.useEffect(() => {
    evaluateCode();
  }, [evaluateCode]);

  const fallbackRender = useCallback(({ error, resetErrorBoundary }) => {
    return (
      <div role="alert" style={{
        padding: '20px',
        color: 'red',
        width: '100%',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center'
      }}>
        <p>运行时错误:</p>
        <pre style={{
          whiteSpace: 'pre-wrap',
          wordBreak: 'break-word',
          background: '#fff1f0',
          padding: '10px',
          borderRadius: '4px',
          border: '1px solid #ffccc7',
          maxWidth: '90%',
          margin: '10px 0'
        }}>
          {error?.message || '未知错误'}
        </pre>
        <button
          onClick={resetErrorBoundary}
          style={{
            padding: '8px 16px',
            background: '#4a4d55',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
            marginTop: '10px'
          }}
        >
          重试
        </button>
      </div>
    );
  }, []);

  return (
    <ErrorBoundary
      fallbackRender={fallbackRender}
      onReset={() => {
        setPreviewState({ result: null, error: null });
        evaluateCode();
      }}
      resetKeys={[code]}
    >
      <div style={{
        background: "white",
        width: "100%",
        height: "29vh",
        overflow: "auto",
        position: "relative"
      }}>
        <div style={{
          position: "absolute",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          minWidth: "100%",
          minHeight: "100%",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          padding: "20px"
        }}>
          {previewState.error ? (
            <div style={{
              color: 'red',
              width: '100%',
              height: '100%',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center',
              alignItems: 'center'
            }}>
              <p>编译错误:</p>
              <pre style={{
                whiteSpace: 'pre-wrap',
                wordBreak: 'break-word',
                background: '#fff1f0',
                padding: '10px',
                borderRadius: '4px',
                border: '1px solid #ffccc7',
                maxWidth: '90%',
                margin: '10px 0'
              }}>
                {previewState.error.message || '未知错误'}
              </pre>
            </div>
          ) : previewState.result ? (
            <div style={{
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              width: '100%',
              height: '100%'
            }}>
              {React.createElement(previewState.result)}
            </div>
          ) : null}
        </div>
      </div>
    </ErrorBoundary>
  );
};

export default Preview; 