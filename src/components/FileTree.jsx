import React from 'react';
import { Treebeard } from "react-treebeard";
import { invoke } from "@tauri-apps/api/core";

const convertToFileTree = (item) => {
  const newItem = {
    name: item.name,
    toggled: false,
    active: false,
  };

  if (item.is_directory && item.children.length > 0) {
    newItem.children = item.children.map(convertToFileTree);
  }

  return newItem;
};

const FileTree = ({ onFileSelect }) => {
  const [fileTree, setFileTree] = React.useState(null);
  const [cursor, setCursor] = React.useState(null);

  React.useEffect(() => {
    const fetchFileTree = async () => {
      try {
        const result = await invoke("list_files_and_directories", {
          dirPath: "/Users/kkiritoliu/Desktop/项目/AI-code-compiler/public"
        });

        const convertedTree = {
          name: 'AI-code-compiler',
          toggled: true,
          active: false,
          children: result.children ? result.children.map(convertToFileTree) : []
        };

        setFileTree(convertedTree);
      } catch (error) {
        console.error("Error fetching file tree:", error);
      }
    };

    fetchFileTree();
  }, []);

  const onToggle = async (node, toggled) => {
    try {
      // 直接修改节点状态
      if (cursor) {
        cursor.active = false;
      }
      node.active = true;
      if (node.children) {
        node.toggled = toggled;
      }

      // 强制更新状态
      setFileTree({ ...fileTree });
      setCursor(node);

      if (!node.children) {
        const response = await fetch(`./${node.name}`);
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const code = await response.text();
        onFileSelect(node.name, code);
      }
    } catch (error) {
      console.error("Error handling file:", error);
    }
  };

  if (!fileTree) return null;

  return (
    <div style={{ height: "100%", background: "#23262e", padding: 10, boxSizing: "border-box" }}>
      <Treebeard
        data={fileTree}
        onToggle={onToggle}
        style={{
          tree: {
            base: {
              listStyle: 'none',
              backgroundColor: '#23262e',
              margin: 0,
              padding: 0,
              color: '#fff',
              fontFamily: 'lucida grande ,tahoma,verdana,arial,sans-serif',
              fontSize: '14px'
            },
            node: {
              base: {
                position: 'relative',
                padding: '4px 8px',
                cursor: 'pointer'
              },
              link: {
                cursor: 'pointer',
                position: 'relative',
                padding: '0px 5px',
                display: 'block'
              },
              active: {
                backgroundColor: '#393c43'
              },
              toggle: {
                base: {
                  position: 'relative',
                  display: 'inline-block',
                  verticalAlign: 'top',
                  marginLeft: '-5px',
                  height: '24px',
                  width: '24px'
                },
                wrapper: {
                  position: 'absolute',
                  top: '50%',
                  left: '50%',
                  margin: '-7px 0 0 -7px',
                  height: '14px'
                },
                height: 10,
                width: 10,
                arrow: {
                  fill: '#fff',
                  strokeWidth: 0
                }
              },
              header: {
                base: {
                  display: 'inline-block',
                  verticalAlign: 'top',
                  color: '#fff'
                },
                connector: {
                  width: '2px',
                  height: '12px',
                  borderLeft: 'solid 2px #fff',
                  borderBottom: 'solid 2px #fff',
                  position: 'absolute',
                  top: '0px',
                  left: '-21px'
                },
                title: {
                  lineHeight: '24px',
                  verticalAlign: 'middle'
                }
              },
              subtree: {
                listStyle: 'none',
                paddingLeft: '19px'
              },
              loading: {
                color: '#E2C089'
              }
            }
          }
        }}
      />
    </div>
  );
};

export default FileTree; 