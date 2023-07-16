// eslint-disable-next-line no-unused-vars
import React from 'react';
import { Button, Form, Input, InputNumber, Space, message } from 'antd';
import MainLayout from '../../../layout/main';
import CardComponent from '../../common/card/CardComponent';
import styles from './styles.module.css';
import { MinusCircleTwoTone, PlusCircleTwoTone } from '@ant-design/icons';
import { addRecord, addRecords } from '../../../../api/list'
import { ID_COMMODITIES } from '../../../common/const'

const idApp = kintone.app.getId() || kintone.mobile.app.getId();

export default function FormRegister({ type, event, isAdmin }) {
  const onFinish = ({commodities}) => {
    commodities.map((commodity) => {
      const body = {
        app: idApp,
        record: {
          commodityName: {
            value: commodity.name
          }
        }
      }
      addRecord(body).then((response) => {
        if (commodity.trademark.length > 0) {
          const records = [];
          commodity.trademark.forEach(({trademark, quantity}) => {
            records.push({
              trademark: {
                value: trademark
              },
              commodityId: {
                value: parseInt(response.id)
              },
              quantity: {
                value: parseInt(quantity)
              }
            })
          });
          const bodyTradeMark = {
            app: ID_COMMODITIES,
            records
          }
          addRecords(bodyTradeMark).then(response => {
            window.location.href = `${window.location.origin}/k/${idApp}`;
            setTimeout(()=> {message.success('作成完了！')}, 300);
          });
        }
      })
    })
  };

  const childFormField = (name) => {
    return <Form.List name={[name, 'trademark']}>
    {(fieldsTrademark, { add, remove }) => (
      <>
        {fieldsTrademark.map(({ key, name, ...restField }) => (
          <Space
            key={key}
            className={styles.spaceChild}
          >
            <Form.Item
              {...restField}
              name={[name, 'trademark']}
              rules={[
                {
                  required: true,
                  message: '酒の種名を入力してください！',
                },
              ]}
              style={{
                marginBottom: '0px',
                width: 205
              }}
            >
              <Input placeholder="酒種名" />
            </Form.Item>
            <Form.Item
              {...restField}
              name={[name, 'quantity']}
              rules={[
                {
                  required: true,
                  message: '量入力してください！',
                },
              ]}
              style={{
                marginBottom: '0px',
                width: 150
              }}
            >
              <InputNumber
                addonAfter="本"
                formatter={(value) => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                />
            </Form.Item>
            { key > 0 && <MinusCircleTwoTone className={styles.iconDelete} onClick={() => remove(name)} /> }
          </Space>
        ))}
        <Form.Item>
          <PlusCircleTwoTone className={styles.iconAdd} onClick={() => add()} />
        </Form.Item>
      </>
    )}
  </Form.List>}

  return (
    <MainLayout isAdmin={isAdmin}>
      <CardComponent 
        title={'在庫管理'}
        btnLeft={"戻る"}
        onClickLeft={() =>(window.location.href = `${window.location.origin}/k/${idApp}`)}
      >
        <Form
            name="dynamic_form_nest_item"
            onFinish={onFinish}
            style={{
              maxWidth: 600,
            }}
            initialValues={{
              commodities: [
                {
                  name: ""
                }
              ]
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
                        name={[name, 'name']}
                        rules={[
                          {
                            required: true,
                            message: 'カテゴリ入力してください！',
                          },
                        ]}
                        style={{
                          marginBottom: '10px'
                        }}
                      >
                        <Input placeholder="カテゴリ" />
                      </Form.Item>
                      {childFormField(name)}
                      { key > 0 && <MinusCircleTwoTone className={`${styles.iconDelete} ${styles.iconAbsolute}`} onClick={() => remove(name)} /> }
                    </Space>
                  ))}
                  <Form.Item style={{display: 'inline-flex', gap: 20}}>
                    <Button type="primary" onClick={() => add()}>
                      <PlusCircleTwoTone className={`${styles.iconAdd} ${styles.left0} ${styles.top0}`} />カテゴリ追加
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
  )}