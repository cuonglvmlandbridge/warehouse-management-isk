// eslint-disable-next-line no-unused-vars
import React from 'react';
import MainLayout from '../../layout/main';
import CardComponent from '../common/card/CardComponent';
import styles from './styles.module.css';
import dayjs from 'dayjs';

export default function Detail({isAdmin, setShowDetail, historyTrademark}) {
  return (
    <MainLayout isAdmin={isAdmin}>
      <CardComponent
        title={"更新履歴"}
        btnLeft={"戻る"}
        onClickLeft={() => setShowDetail(false)}
      >
      <div className={styles.header}>
        <div className={styles.w15}>日時</div>
        <div className={styles.w15}>更新者</div>
        <div className={styles.w15}>本数</div>
        <div className={`${styles.w55} ${styles.textLeft}`}>内容</div>
      </div>
      {
        historyTrademark.length > 0 && historyTrademark.map(({quantity, trademark, updateDateTime, userUpdate, description}, tradeIndex) => (
          <div key={`${tradeIndex}_${userUpdate}`} className={styles.column}>
            <div className={styles.w15}>{dayjs(updateDateTime).format('YYYY/MM/DD HH:mm')}</div>
            <div className={styles.w15}>{userUpdate}</div>
            <div className={styles.w15}>{quantity}</div>
            <div className={`${styles.w55} ${styles.textLeft}`}>{description}</div>
          </div>
        ))
      }
      </CardComponent>  
    </MainLayout>
  );
}