// eslint-disable-next-line no-unused-vars
import React, { useEffect, useState } from "react";
import { Button, Form, Input, InputNumber, Space, message } from "antd";
import MainLayout from "../../../layout/main";
import CardComponent from "../../common/card/CardComponent";
import styles from "./styles.module.css";
import { MinusCircleTwoTone, PlusCircleTwoTone } from "@ant-design/icons";
import { getRecords, addRecord, addRecords, updateRecord, updateRecords, deleteRecords } from "../../../../api/list";
import { ID_COMMODITIES, ID_HISTORY_COMMODITIES } from "../../../common/const";

const idApp = kintone.app.getId() || kintone.mobile.app.getId();

export default function FormRegister({ type, event, isAdmin }) {
  const [form] = Form.useForm();
  const [tradeMarkIds, setTradeMarkIds] = useState([]);

  useEffect(() => {
    if (!event.record.$id) {
      form.setFieldValue("commodities", [
        {
          name: "",
          trademark: [{
            trademark: '',
            minQuantity: '',
            quantity: ''
          }]
        },
      ]);

      return;
    }

    const trademarkBody = {
      app: ID_COMMODITIES,
      query: `commodityId = ${event.record.$id.value}`,
    };
    getRecords(trademarkBody).then((trademarks) => {
      const tradeMarkData = [];
      const tradeMarkIds = []
      if (trademarks.records.length > 0) {
        trademarks.records.forEach((trademark) => {
          tradeMarkData.push({
            tradeMarkId: trademark.$id.value,
            trademark: trademark.trademark.value,
            quantity: trademark.quantity.value,
            minQuantity: trademark?.minQuantity
              ? trademark.minQuantity.value
              : "",
          });
          tradeMarkIds.push(trademark.$id.value);
        });
        setTradeMarkIds(tradeMarkIds);
        form.setFieldValue("commodities", [
          {
            commodityId: event.record.$id.value,
            name: event.record.commodityName.value,
            trademark: tradeMarkData,
          },
        ]);
      }
    });
  }, [event]);

  const onFinish = ({ commodities }) => {
    commodities.map((commodity) => {
      let body = {
        app: idApp,
        record: {
          commodityName: {
            value: commodity.name,
          },
        },
      };
      if (commodity.commodityId) {
        const commodityId = commodity.commodityId;
        body.id = commodity.commodityId;
        let bodyTradeMarkUpdate = {
          app: ID_COMMODITIES,
          records: []
        }
        let bodyTradeMarkCreate = {
          app: ID_COMMODITIES,
          records: []
        }
        let bodyDelete = {
          app: ID_COMMODITIES,
          ids: tradeMarkIds
        }
        commodity.trademark.forEach((tradeMark) => {
          if (tradeMark.tradeMarkId) {
            bodyTradeMarkUpdate.records.push({
              id: tradeMark.tradeMarkId,
              record: {
                trademark: {
                  value: tradeMark.trademark,
                },
                commodityId: {
                  value: commodityId,
                },
                quantity: {
                  value: parseInt(tradeMark.quantity),
                },
                minQuantity: {
                  value: parseInt(tradeMark.minQuantity),
                },
              }
            })
          } else {
            bodyTradeMarkCreate.records.push({
              trademark: {
                value: tradeMark.trademark,
              },
              commodityId: {
                value: commodityId,
              },
              quantity: {
                value: parseInt(tradeMark.quantity),
              },
              minQuantity: {
                value: parseInt(tradeMark.minQuantity),
              }
            })
          }
          if (bodyDelete.ids.includes(tradeMark.tradeMarkId)) {
            const valueToRemove = tradeMark.tradeMarkId;
            const index = bodyDelete.ids.indexOf(valueToRemove);
            if (index !== -1) {
              bodyDelete.ids.splice(index, 1);
            }
          }
        })
    
        if (bodyTradeMarkUpdate.records.length > 0) {
          updateRecords(bodyTradeMarkUpdate)
        }
        if (bodyTradeMarkCreate.records.length > 0) {
          addRecords(bodyTradeMarkCreate)
        }
        if (bodyDelete.ids.length > 0) {
          deleteRecords(bodyDelete)
        }
        updateRecord(body);
        window.location.href = `${window.location.origin}/k/${idApp}`;
        message.success("作成完了！");
      } else {
        addNewData(bodyAdd, commodity);
      }
    });
  };

  const addNewData = (body, commodity) => {
    addRecord(body).then((response) => {
      if (commodity.trademark.length > 0) {
        const records = [];
        commodity.trademark.forEach(
          ({ trademark, quantity, minQuantity }) => {
            records.push({
              trademark: {
                value: trademark,
              },
              commodityId: {
                value: parseInt(response.id),
              },
              quantity: {
                value: parseInt(quantity),
              },
              minQuantity: {
                value: parseInt(minQuantity),
              },
            });
          }
        );

        const bodyTradeMark = {
          app: ID_COMMODITIES,
          records,
        };
        addRecords(bodyTradeMark).then((response) => {
          response.ids.map((val, index) => {
            const bodyHistoryTradeMark = {
              app: ID_HISTORY_COMMODITIES,
              record: {
                trademarkId: {
                  value: val,
                },
                trademark: {
                  value: commodity.trademark[index].trademark,
                },
                quantity: {
                  value: parseInt(commodity.trademark[index].quantity),
                },
                description: {
                  value: "新規追加しました",
                },
              },
            };
            addRecord(bodyHistoryTradeMark);
          });
          window.location.href = `${window.location.origin}/k/${idApp}`;
          message.success("作成完了！");
        });
      }
    });
  }

  const childFormField = (name) => {
    return (
      <Form.List name={[name, "trademark"]}>
        {(fieldsTrademark, { add, remove }) => (
          <>
            {fieldsTrademark.map(({ key, name, ...restField }) => (
              <Space key={key} className={styles.spaceChild}>
                <Form.Item
                  {...restField}
                  name={[name, "trademark"]}
                  rules={[
                    {
                      required: true,
                      message: "酒の種名を入力してください！",
                    },
                  ]}
                  style={{
                    marginBottom: "0px",
                    width: 205,
                  }}
                >
                  <Input placeholder="酒種名" />
                </Form.Item>
                <Form.Item
                  {...restField}
                  name={[name, "quantity"]}
                  rules={[
                    {
                      required: true,
                      message: "量入力してください！",
                    },
                  ]}
                  style={{
                    marginBottom: "0px",
                    width: 150,
                  }}
                >
                  <InputNumber
                    placeholder="量"
                    addonAfter="本"
                    formatter={(value) =>
                      `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")
                    }
                  />
                </Form.Item>
                <Form.Item
                  {...restField}
                  name={[name, "minQuantity"]}
                  style={{
                    marginBottom: "0px",
                    width: 150,
                  }}
                >
                  <InputNumber
                    placeholder="最小値"
                    addonAfter="本"
                    formatter={(value) =>
                      `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")
                    }
                  />
                </Form.Item>
                {key > 0 && (
                  <MinusCircleTwoTone
                    className={styles.iconDelete}
                    onClick={() => remove(name)}
                  />
                )}
              </Space>
            ))}
            <Form.Item>
              <PlusCircleTwoTone
                className={styles.iconAdd}
                onClick={() => add()}
              />
            </Form.Item>
          </>
        )}
      </Form.List>
    );
  };

  return (
    <MainLayout isAdmin={isAdmin}>
      <CardComponent
        title={"在庫管理"}
        btnLeft={"戻る"}
        onClickLeft={() =>
          (window.location.href = `${window.location.origin}/k/${idApp}`)
        }
      >
        <Form
          form={form}
          name="dynamic_form_nest_item"
          onFinish={onFinish}
          style={{
            maxWidth: 670,
          }}
          autoComplete="off"
        >
          <Form.List name="commodities">
            {(fields, { add, remove }) => (
              <>
                {fields.map(({ key, name, ...restField }) => (
                  <Space
                    key={key}
                    className={styles.spaceParent}
                    align="baseline"
                  >
                    <Form.Item
                      {...restField}
                      name={[name, "name"]}
                      rules={[
                        {
                          required: true,
                          message: "カテゴリ入力してください！",
                        },
                      ]}
                      style={{
                        marginBottom: "10px",
                      }}
                    >
                      <Input placeholder="カテゴリ" />
                    </Form.Item>
                    {childFormField(name)}
                    {key > 0 && (
                      <MinusCircleTwoTone
                        className={`${styles.iconDelete} ${styles.iconAbsolute}`}
                        onClick={() => remove(name)}
                      />
                    )}
                  </Space>
                ))}
                <Form.Item style={{ display: "inline-flex", gap: 20 }}>
                  <Button type="primary" onClick={() => add()}>
                    <PlusCircleTwoTone
                      className={`${styles.iconAdd} ${styles.left0} ${styles.top0}`}
                    />
                    カテゴリ追加
                  </Button>
                  <Button type="primary" htmlType="submit">
                    保存
                  </Button>
                </Form.Item>
              </>
            )}
          </Form.List>
        </Form>
      </CardComponent>
    </MainLayout>
  );
}
