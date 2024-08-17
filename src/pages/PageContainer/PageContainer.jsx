import React from "react";
import styles from "./PageContainer.module.css";
import SideBar from "../../components/SideBar/SideBar";

function PageContainer({ children }) {
  return (
    <>
     <SideBar />
     <div className={styles.page}>{children}</div>
    </>
  )
}

export default PageContainer;