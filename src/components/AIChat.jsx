import React, { useRef, useEffect } from 'react';
import { Button, Select, TextArea, Spin } from '@douyinfe/semi-ui';

const AIChat = ({
  messages,
  isLoading,
  modelName,
  onModelChange,
  onSendMessage
}) => {
  const messagesEndRef = useRef(null);
  const [inputContent, setInputContent] = React.useState('');

  const scrollToBottom = () => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollTo({
        top: messagesEndRef.current.scrollHeight,
        behavior: 'smooth'
      });
    }
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSubmit = () => {
    if (!inputContent.trim()) return;
    onSendMessage(inputContent);
    setInputContent('');
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <div
        ref={messagesEndRef}
        style={{
          flex: 1,
          overflowY: 'auto',
          padding: 20,
        }}>
        {messages.map((msg, index) => (
          <div key={index} style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: msg.role === 'user' ? 'flex-end' : 'flex-start',
            marginBottom: 16
          }}>
            <div style={{
              maxWidth: '80%',
              padding: '12px 16px',
              borderRadius: msg.role === 'user' ?
                '12px 12px 0 12px' : '12px 12px 12px 0',
              backgroundColor: msg.role === 'user' ?
                'var(--semi-color-primary)' : '#fff',
              color: msg.role === 'user' ? '#fff' : '#333',
              boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
            }}>
              <div style={{
                fontSize: 12,
                color: msg.role === 'user' ? 'rgba(255,255,255,0.8)' : '#666',
                marginBottom: 4
              }}>
                {msg.role === 'user' ? 'You' : 'AI Assistant'}
              </div>
              <pre style={{
                whiteSpace: 'pre-wrap',
                margin: 0,
              }}>{msg.content}</pre>
            </div>
            <span style={{
              fontSize: 12,
              color: '#999',
              marginTop: 4
            }}>{msg.time}</span>
          </div>
        ))}
        {isLoading && (
          <div style={{
            textAlign: 'center',
            padding: 16,
            color: '#666'
          }}>
            <Spin /> 思考中...
          </div>
        )}
      </div>
      <div style={{
        display: 'flex',
        gap: 12,
        padding: '16px 24px',
        borderTop: '1px solid var(--semi-color-border)',
        alignItems: 'center'
      }}>
        <Select
          value={modelName}
          style={{ width: 160 }}
          disabled={isLoading}
          onChange={onModelChange}
          position="top"
        >
          <Select.Option value="DeepSeek-R1">DeepSeek-R1</Select.Option>
          <Select.Option value="gpt-3.5-turbo">gpt-3.5-turbo</Select.Option>
          <Select.Option value="gpt-4">gpt-4</Select.Option>
          <Select.Option value="gpt-4-turbo">gpt-4-turbo</Select.Option>
          <Select.Option value="hunyuan-t1-latest">hunyuan-t1-latest</Select.Option>
          <Select.Option value="gemini-1.5-flash-8b">gemini-1.5-flash-8b</Select.Option>
        </Select>

        <div style={{
          flex: 1,
          position: 'relative',
          display: 'flex',
          gap: 8
        }}>
          <TextArea
            value={inputContent}
            onChange={value => setInputContent(value)}
            autosize={{ minRows: 1, maxRows: 4 }}
            placeholder="输入代码问题..."
            onEnterPress={(e) => {
              e.preventDefault();
              handleSubmit();
            }}
            style={{ flex: 1 }}
          />
          <Button
            theme="solid"
            type="primary"
            loading={isLoading}
            onClick={handleSubmit}
            style={{
              height: 32,
              alignSelf: 'center'
            }}
          >
            发送
          </Button>
        </div>
      </div>
    </div>
  );
};

export default AIChat; 