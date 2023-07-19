// eslint-disable-next-line no-unused-vars
import React, { useState, useEffect } from "react";
import { Modal, Form, InputNumber, Input, message } from "antd";
import MainLayout from "../../layout/main";
import CardComponent from "../common/card/CardComponent";
import { getRecords, addRecord, updateRecord } from "../../../api/list";
import styles from "./styles.module.css";
import { ID_COMMODITIES, ID_HISTORY_COMMODITIES } from "../../common/const";
import Detail from "../detail";
import dayjs from "dayjs";
import { EditOutlined } from '@ant-design/icons';

const idApp = kintone.app.getId() || kintone.mobile.app.getId();

export default function TableList({ isAdmin, event, isMobile }) {
  const [commodities, setCommodities] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedTrademark, setSelectedTrademark] = useState("");
  const [trademarkId, setTrademarkId] = useState(0);
  const [selectedQuantity, setSelectedQuantity] = useState(0);
  const [showDetail, setShowDetail] = useState(false);
  const [historyTrademark, setHistoryTrademark] = useState([]);
  const [isUpdate, setIsUpdate] = useState(false);
  const [form] = Form.useForm();

  const showModal = (trademarkId, trademark, quantity) => {
    form.setFieldValue("quantity", "");
    setSelectedQuantity(quantity);
    setTrademarkId(trademarkId);
    setSelectedTrademark(trademark);
    setIsModalOpen(true);
  };

  const onFinish = (value) => {
    setIsModalOpen(false);
    setIsUpdate(false);
    const bodyHistoryTradeMark = {
      app: ID_HISTORY_COMMODITIES,
      record: {
        trademark: {
          value: selectedTrademark,
        },
        quantity: {
          value: value.quantity,
        },
        trademarkId: {
          value: trademarkId,
        },
        description: {
          value: value.description,
        },
      },
    };
    const bodyTradeMark = {
      app: ID_COMMODITIES,
      id: trademarkId,
      record: {
        quantity: {
          value: parseInt(value.quantity) + parseInt(selectedQuantity),
        },
      },
    };
    updateRecord(bodyTradeMark).then((response) => {
      setIsUpdate(true);
    });
    addRecord(bodyHistoryTradeMark).then((response) => {
      message.success("更新完了！");
    });
  };

  const handleCancel = () => {
    setIsModalOpen(false);
  };

  const handleShowDetail = (trademarkId) => {
    let historyTrademark = [];
    const trademarkBody = {
      app: ID_HISTORY_COMMODITIES,
      query: `trademarkId = ${trademarkId}`,
    };

    getRecords(trademarkBody).then((trademark) => {
      if (trademark.records.length > 0) {
        trademark.records.forEach(
          ({
            $id,
            quantity,
            trademark,
            description,
            Updated_datetime,
            Updated_by,
          }) => {
            historyTrademark.push({
              id: $id.value,
              quantity: quantity.value,
              trademark: trademark.value,
              description: description.value,
              updateDateTime: Updated_datetime.value,
              userUpdate: Updated_by.value.name,
            });
          }
        );
        setHistoryTrademark(historyTrademark);
        setShowDetail(true);
      }
    });
  };

  const saveMinQuantity = (event, id) => {
    if (event.target.value > 0) {
      const bodyTradeMark = {
        app: ID_COMMODITIES,
        id: id,
        record: {
          minQuantity: {
            value: event.target.value,
          },
        },
      };
      updateRecord(bodyTradeMark).then(() => {
        fetchData();
        message.success("最小値の設定ができました！");
      });
    }
  };

  useEffect(() => {
    isUpdate && fetchData();
  }, [isUpdate]);

  useEffect(() => {
    if (!isUpdate) {
      setIsUpdate(true);
    }
  }, []);

  const fetchData = () => {
    const body = {
      app: idApp,
    };
    getRecords(body).then((response) => {
      if (response.records.length > 0) {
        let countMinQuantity = 0;
        Promise.all(
          response.records.map(({ commodityName, $id }) => {
            const trademarkBody = {
              app: ID_COMMODITIES,
              query: `commodityId = ${$id.value}`,
            };

            return getRecords(trademarkBody).then((trademark) => {
              if (trademark.records.length > 0) {
                trademark.records.forEach(({ minQuantity, quantity }) => {
                  if (minQuantity?.value >= quantity?.value) {
                    countMinQuantity += 1;
                    return;
                  }
                });
                const trademarkData = trademark.records.map(
                  ({
                    $id,
                    quantity,
                    trademark,
                    Updated_datetime,
                    Updated_by,
                    minQuantity,
                  }) => ({
                    id: $id.value,
                    quantity: quantity.value,
                    trademark: trademark.value,
                    updateDateTime: Updated_datetime.value,
                    userUpdate: Updated_by.value.name,
                    minQuantity: minQuantity.value,
                  })
                );
                return {
                  commodityName: commodityName.value,
                  commodityId: $id.value,
                  trademarkData,
                };
              }
              return null;
            });
          })
        ).then((results) => {
          const filteredResults = results.filter(Boolean);
          setCommodities(filteredResults);
          if (countMinQuantity > 0) {
            message.error("在庫数が少なくなっているボトルがあります。");
          }
        });
      }
    });
  };

  return !showDetail ? (
    <MainLayout isAdmin={isAdmin} isMobile={isMobile}>
      <CardComponent
        title={"在庫管理"}
        btnRight={"登録"}
        onClickRight={() =>
          (window.location.href = `${window.location.origin}/k/${
            isMobile ? "m/" : ""
          }${idApp}/edit`)
        }
      >
        {commodities.map(
          ({ commodityId, commodityName, trademarkData }, index) => (
            <div key={index}>
              <div className={styles.header}>
                <div className={styles.w15}>{commodityName}</div>
                <div className={styles.w15}>ボトル名</div>
                <div className={styles.w15}>在庫</div>
                <div className={styles.w25}>更新日時</div>
                <div className={styles.w15}>更新者</div>
                <div className={styles.w15}>最小値設定</div>
                <div className={styles.w20}>
                  <span
                    className={styles.clickLink}
                    onClick={() => {
                      if (!isMobile) {
                        window.location.href = `${window.location.origin}/k/${idApp}/show#record=${commodityId}&mode=edit`;
                      } else {
                        window.location.href = `${window.location.origin}/k/m/${idApp}/show?record=${commodityId}#mode=edit`;
                      }
                    }}
                  >
                    <EditOutlined />
                  </span>
                </div>
              </div>
              {trademarkData.map(
                (
                  {
                    id,
                    quantity,
                    trademark,
                    updateDateTime,
                    userUpdate,
                    minQuantity,
                  },
                  tradeIndex
                ) => (
                  <div
                    key={`${tradeIndex}_${userUpdate}`}
                    className={styles.column}
                  >
                    <div className={styles.w15}>{tradeIndex + 1}</div>
                    <div
                      className={`${styles.w15} ${
                        minQuantity >= quantity && styles.colorRed
                      }`}
                    >
                      {trademark}
                    </div>
                    <div className={styles.w15}>{quantity}</div>
                    <div className={styles.w25}>
                      {dayjs(updateDateTime).format("YYYY/MM/DD HH:mm")}
                    </div>
                    <div className={styles.w15}>{userUpdate}</div>
                    <div className={styles.w15}>
                      <InputNumber
                        placeholder="最小値"
                        defaultValue={minQuantity}
                        addonAfter="本"
                        min="1"
                        formatter={(value) =>
                          `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")
                        }
                        onPressEnter={(event) => saveMinQuantity(event, id)}
                      />
                    </div>
                    <div className={styles.w20}>
                      <span
                        className={`${styles.clickLink} ${styles.r20}`}
                        onClick={() => showModal(id, trademark, quantity)}
                      >
                        追加
                      </span>
                      <span
                        className={styles.clickLink}
                        onClick={() => handleShowDetail(id)}
                      >
                        更新履歴
                      </span>
                    </div>
                  </div>
                )
              )}
            </div>
          )
        )}
      </CardComponent>

      <Modal
        title="在庫追加"
        okText="更新"
        cancelText="キャンセル"
        centered
        open={isModalOpen}
        onOk={form.submit}
        onCancel={handleCancel}
      >
        <Form
          form={form}
          name="editTrdemark"
          onFinish={onFinish}
          style={{
            display: "inline-flex",
            gap: 20,
            alignItems: "center",
            justifyContent: "center",
            width: "100%",
          }}
        >
          <span style={{ color: "#000000" }}>{selectedTrademark}</span>
          <Form.Item
            name="quantity"
            rules={[{ required: true, message: "量入力してください！" }]}
            style={{ marginBottom: 0 }}
          >
            <InputNumber
              addonAfter="本"
              formatter={(value) =>
                `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")
              }
              style={{ width: 100 }}
            />
          </Form.Item>
          <Form.Item name="description" style={{ marginBottom: 0 }}>
            <Input placeholder="内容" style={{ width: 200 }} />
          </Form.Item>
        </Form>
      </Modal>
    </MainLayout>
  ) : (
    <Detail
      historyTrademark={historyTrademark}
      setShowDetail={setShowDetail}
      isAdmin={isAdmin}
    />
  );
}
