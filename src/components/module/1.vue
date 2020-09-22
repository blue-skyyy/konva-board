/** * 批改作业 * 需要优化内部拆分为组件 右侧应化为组件 */ /** *
1.暂存需要c++提供额外注册回调函数 */
<template>
  <div class="correctionworkh5-cont">
    <div class="correctionHeader">
      <DecHeader :text="dealTitle()" @goBack="goBack">
        <el-button-group>
          <el-button
            v-if="!isHistory"
            :class="{ focus: dealTableStatus(attribute, CORRECT_WORK) }"
            style="border:none;color:#000;background:transparent;"
            :name="CORRECT_WORK"
            @click="chooseCheck($event, 'attribute')"
            size="mini"
            >批改作业</el-button
          >
          <el-button
            v-if="!getData.notHaveHistory"
            :class="{
              focus: dealTableStatus(attribute, HOISTORY_WORK) || isHistory
            }"
            :name="HOISTORY_WORK"
            style="border:none;color:#000;background:transparent;"
            @click="chooseCheck($event, 'attribute')"
            size="mini"
            >历史提交</el-button
          >
        </el-button-group>
      </DecHeader>
    </div>
    <div
      class="correctionContent"
      v-if="!isHistory"
      v-show="dealTableStatus(attribute, CORRECT_WORK)"
    >
      <div
        class="correctionCanvas"
        ref="correctionCanvas"
        v-if="currentCorrection"
      >
        <!-- style="flexGrow:1;" -->
        <!-- width="calc(100%- 10px)" -->
        <!-- height="calc(100vh - 160px)" -->

        <div class="image-decorator-wrap">
          <image-decorator
            ref="decorator"
            :imageList="imageList"
            :config="config"
            @indexChange="dealIndexChange"
            @filterCoustomImg="filterCoustomImg"
          />
        </div>
        <div class="correctionEdit">
          <div class="recordBdBox" v-if="recordStatus">
            <CoverUp>
              <Record @save="recordSave" @cancel="recordCancel" />
            </CoverUp>
          </div>
          <div class="textButtonBdBox" v-if="textButtonStatus">
            <CoverUp>
              <TextButtom
                @save="textButtonSave"
                :status="textButtomDisableStatus"
              />
            </CoverUp>
          </div>
          <el-row>
            <el-col :span="24" class="margin-bottom-10">
              <el-card
                shadow="hover"
                :body-style="bodyStyle"
                v-if="currentValue.questionDetail"
              >
                <div class="topic">
                  <div class="topicTitle">大题:</div>
                  <div class="topicContent">
                    <el-button
                      :type="dealType(item.type)"
                      class="topicButton"
                      v-for="(item, index) in getData.list"
                      :key="dealId(index)"
                      @click="chooseTopic(index)"
                      >{{ item.questionDetail.sequence }}</el-button
                    >
                  </div>
                </div>
                <div
                  class="topic"
                  v-if="currentValue.questionDetail && currentMinorStatus"
                >
                  <div class="topicTitle">小题:</div>
                  <div class="topicContent">
                    <!--批改前，和批改后的小题展示应该存在不同-->
                    <el-button
                      :type="dealType(item.type)"
                      class="topicButton"
                      v-for="(item, index) in currentValue.questionDetail
                        .minorLists"
                      :key="dealId(index)"
                      @click="chooseItem(index)"
                      >{{ ++index }}</el-button
                    >
                  </div>
                </div>
                <div class="topicControl">
                  <div class="topicTitle">占位:</div>
                  <el-button type="primary" size="mine" @click="decideTopic">
                    {{ currentText }}
                  </el-button>
                </div>
              </el-card>
            </el-col>
            <el-col :span="24" v-if="currentValue.prepareList">
              <el-card shadow="hover" :body-style="bodyStyle">
                <div class="titleBox">
                  <div class="cardText">备课语音</div>
                  <div class="cardButtom" @click="recordButtom(1)">
                    <el-button type="danger" plain size="mini"
                      >录制语音</el-button
                    >
                  </div>
                </div>
                <ul class="prepareBox">
                  <li
                    v-for="item in dealPrepareListType(
                      currentValue.prepareList,
                      0
                    )"
                    :key="dealId(item.id)"
                    class="activeAudio"
                    @click="changeAudioUrl(item.fileUrl, item.id)"
                    @dblclick="audioFn(item.fileUrl)"
                  >
                    <el-tooltip :content="item.fileName">
                      <el-button
                        type="primary"
                        round
                        size="mini"
                        v-if="dealActiveAudio(item.fileUrl, item.id)"
                        >{{ dealLongText(item.fileName, 6) }}</el-button
                      >
                      <el-button round size="mini" v-else>
                        {{ dealLongText(item.fileName, 6) }}
                      </el-button>
                    </el-tooltip>
                  </li>
                </ul>
              </el-card>
            </el-col>
            <el-col :span="24" v-if="currentValue.prepareList">
              <el-card shadow="hover" :body-style="bodyStyle">
                <div class="titleBox">
                  <div class="cardText">备课图片</div>
                </div>
                <ul class="prepareBox">
                  <li
                    v-for="item in dealPrepareListType(
                      currentValue.prepareList,
                      1
                    )"
                    :key="dealId(item.id)"
                    @click="changePrepareImage(item)"
                  >
                    <el-tooltip :content="item.fileName">
                      <el-button
                        type="primary"
                        round
                        size="mini"
                        v-if="dealActiveImage(item.id)"
                        >{{ dealLongText(item.fileName, 6) }}</el-button
                      >
                      <el-button round size="mini" v-else>
                        {{ dealLongText(item.fileName, 6) }}
                      </el-button>
                    </el-tooltip>
                  </li>
                </ul>
              </el-card>
            </el-col>
            <el-col :span="24">
              <el-card shadow="hover" :body-style="bodyStyle">
                <div class="titleBox">
                  <div class="cardText">现场语音</div>
                  <div class="cardButtom" @click="recordButtom(0)">
                    <el-button type="danger" plain size="mini"
                      >录制语音</el-button
                    >
                  </div>
                </div>
                <ul class="prepareBox" v-if="currentValue.currentScenes">
                  <li
                    v-for="item in currentValue.currentScenes"
                    :key="dealId(item.id)"
                    class="activeAudio"
                    @click="changeAudioUrl(item.fileUrl)"
                    @dblclick="audioFn(item.fileUrl)"
                  >
                    <el-tooltip :content="item.fileName">
                      <el-button
                        type="primary"
                        round
                        size="mini"
                        v-if="dealActiveAudio(item.fileUrl)"
                        >{{ dealLongText(item.fileName, 6) }}</el-button
                      >
                      <el-button round size="mini" v-else>
                        {{ dealLongText(item.fileName, 6) }}
                      </el-button>
                    </el-tooltip>
                  </li>
                </ul>
              </el-card>
            </el-col>
            <el-col
              :span="24"
              class="teacherRemark"
              v-if="getData.notHaveHistory"
            >
              <el-card shadow="hover" :body-style="bodyStyle">
                <el-col :span="24" class="margin-bottom-10">
                  <el-col :span="5" class="teacherTitle">老师评语</el-col>
                  <el-col :span="10">
                    <el-select
                      class="selectTeacher"
                      v-model="review.selectValue"
                      placeholder="请选择快捷输入"
                      @click="clikeRemark"
                      @change="changeSelect"
                    >
                      <el-option
                        v-for="(item, index) in options"
                        :key="dealId(index)"
                        :label="item.text"
                        :value="item.id"
                        style="paddingLeft:15%;"
                      ></el-option>
                    </el-select>
                  </el-col>
                  <el-col :span="7" :offset="1">
                    <el-button
                      size="small"
                      class="teacherButton"
                      @click="editRemark"
                      >编辑评语</el-button
                    >
                  </el-col>
                </el-col>
                <el-col :span="24" class="margin-bottom-10">
                  <el-input
                    type="textarea"
                    rows="8"
                    resize="none"
                    placeholder="输入评语，或选择左侧的快捷输入"
                    v-model="review.textArea"
                  ></el-input>
                </el-col>
              </el-card>
            </el-col>
          </el-row>
          <el-col :span="24" v-if="currentValue.questionDetail">
            <el-card shadow="hover" :body-style="bodyStyle">
              <div class="cardText">教研解析</div>
              <div class="math-editor-box">
                <div class="math-editor-c">
                  <math-editor
                    v-show="
                      currentValue.questionDetail.description.useMathEditor
                    "
                    mode="preview"
                    :normalFontSize="20"
                    :smallFontSize="16"
                    ref="mathTextEditor"
                  ></math-editor>
                </div>
              </div>
              <el-input
                v-show="!currentValue.questionDetail.description.useMathEditor"
                type="textarea"
                resize="none"
                :autosize="{ minRows: 2, maxRows: 5 }"
                :value="currentValue.questionDetail.description.analyTxt"
                :disabled="true"
              ></el-input>
            </el-card>
          </el-col>
          <div class="buttonBox">
            <el-button type="primary" @click="cacheSubmit">暂存</el-button>
            <el-button type="primary" @click="submit">确定批改</el-button>
          </div>
        </div>
      </div>
      <div class="notHomework" v-else>暂无作业批改</div>
    </div>
    <EditRemark
      v-if="editRemarkData.status"
      :value="editRemarkData"
      @addEdit="addEdit"
      @delFn="delFn"
      @edit="edit"
    />
    <EditChange
      v-if="editChangeData.status"
      :value="editChangeData"
      @cancelEdit="cancelEdit"
      @saveEdit="saveEdit"
    />
    <History
      :value="getData.listHistory"
      v-if="!dealTableStatus(attribute, CORRECT_WORK) || isHistory"
    />
  </div>
</template>
<script>
import Cookie from "js-cookie";
import I from "module-snippet/status/I.js";
import api from "@/api/correctionwork";
import Upload from "@/util/Upload";
import Validate from "@/util/validate.js";
import { play, audioStatus, pause } from "@/util/audio.js";
import { CORRECT_WORK, HOISTORY_WORK } from "@/constant/attribute";
import { HOME_HAVE_EMPTY } from "@/message/info";
import { CORRECTION } from "@/message/loading";
import {
  UPLOAD_ERROR,
  CORRECTION_POST_ERROR,
  DELETE_ERROR,
  SAVE_ERROR,
  SAVE_SUCCESS,
  DELETE_SUCCESS,
  SAVE_ERROR_RETRY
} from "@/message/status";
import { stringfiy } from "@/util/utilTool";
import DecHeader from "@/components/header/DecHeader";
import Record from "@/components/audio/Record.vue";
import TextButtom from "@/components/alert/TextButton.vue";
import CoverUp from "@/components/background/CoverUp.vue";
import EditRemark from "../correctionwork/EditRemark";
import EditChange from "../correctionwork/EditChange";
import History from "../correctionwork/History";
import { addEvent } from "@/util/utilTool";
import ImageDecorator from "module-image-decorator-vkm/lib/index.js";
// import ImageDecorator from "/work/fengxiao/image-decorator-vkm/lib/index.js";

let emojiList = [];
Array(20)
  .fill(0)
  .forEach((x, index) => {
    let img = require(`./expression/${index + 1}.png`);
    emojiList.push(img);
  });
let components = {
  DecHeader,
  EditRemark,
  EditChange,
  History,
  Record,
  TextButtom,
  ImageDecorator,
  CoverUp
};

let regexp = {
  saveNameRegExp(value) {
    // 保存名称验证
    let validator = new Validate();
    validator.add(value, [
      { strategy: "isNonEmpty", errorMsg: "未填写语音名称！" },
      { strategy: "maxLength:15", errorMsg: "语音名称，请在15字以内！" }
    ]);
    return validator.start();
  }
};

let emit = {
  // 返回
  goBack() {
    this.trackCommon("bees_pc_web_correction_statearea_return");
    history.back();
  },
  // 选择评语
  changeSelect(value) {
    if (value) {
      let obj = this.review.options.find((item) => item.id == value);
      this.review.textArea = this.review.textArea
        ? `${this.review.textArea}, ${obj["text"]}`
        : `${obj["text"]}`;
    } else {
      this.clearTeacher();
    }
  },
  // 图片编辑器切换图片
  changeIndex(tid) {
    let index = this.getData.list.findIndex((list) => list.id == tid);
    if (index === -1) {
      void null;
    } else {
      this.currentTopic = index;
    }
  },
  // 删除评语
  delFn(id) {
    this.$confirm("评语删除后不可恢复哦，确定删除吗", "这是一条通知", {
      confirmButtonText: "确定",
      cancelButtonText: "取消",
      type: "warning"
    })
      .then(() => {
        this.postTextDelete({
          id
        });
      })
      .catch(() => {
        this.$message({
          type: "info",
          message: "已取消删除"
        });
      });
  },
  // 编辑评语
  edit(obj) {
    this.addEdit(obj);
  },
  // 添加评语
  addEdit(obj) {
    this.editChangeData = EditChange.empty({
      status: true,
      ...obj
    });
  },
  // 取消评语编辑
  cancelEdit() {
    this.closeEditChange();
  },
  // 保存评语
  saveEdit(obj) {
    let { id, text } = obj;
    this.postSave({
      id,
      text
    });
  },
  // 录制语音保存
  recordSave(value) {
    this.recordStatus = false;
    this.textButtonStatus = true;
    this.currentBlob = value;
  },
  // 录制语音取消
  recordCancel() {
    this.recordStatus = false;
  },
  // 语音录制名称
  textButtonSave(name) {
    let validator = this.saveNameRegExp(name);
    if (validator) {
      this.$message.error(validator.errorMsg);
    } else {
      this.textButtomDisableStatus = true;
      this.currentBlob.lastModifiedDate = new Date();
      this.currentBlob.name = name;
      this.uploadFile(this.currentBlob);
    }
  }
};

let deal = {
  // 处理重复key
  dealId(index) {
    return (index + 1) * Math.random() * new Date().getTime();
  },
  // 非历史提交并且符合客户端
  dealNativeUnHistory() {
    return !this.isHistory;
  },
  // 处理返回遍历音频还是图片
  dealPrepareListType(lists, type) {
    return lists.filter((list) => list.fileType == type);
  },
  // 处理多文字
  dealLongText(text, length) {
    if (text.length > length) {
      text = `${text.slice(0, length - 1)}...`;
    } else {
      void null;
    }
    return text;
  },
  // 处理title
  dealTitle() {
    return `${this.getaAccountData.zhName} ${this.getaAccountData.id}`;
  },
  // 处理状态是否对应关系
  dealTableStatus(value, source) {
    return value === source;
  },
  // 处理大小题按钮样式
  dealType(value) {
    if (value == 1) {
      return "success";
    } else if (value == 0) {
      return "danger";
    } else {
      return "";
    }
  },
  // 处理大题
  dealTopic(value, status = false) {
    Object.assign(this.getData, {
      list: this.getData.list.map((item, index) => {
        let type = item.type;
        if (value == index) {
          if (status) {
            type = Number(!type);
          } else {
            type = type == 0 ? type : 1;
          }
        } else {
        }
        return {
          ...item,
          type: type
        };
      })
    });
  },
  // 处理小题的大题
  dealTopicFa(value) {
    Object.assign(this.getData, {
      list: this.getData.list.map((item, index) => {
        if (value == index) {
          if (item.questionDetail.minorLists.some((ele) => ele.type == 0)) {
            return {
              ...item,
              type: 0
            };
          } else {
            return {
              ...item,
              type: 1
            };
          }
        } else {
          return item;
        }
      })
    });
  },
  // 处理小题对错
  dealTopicItem(value, status = false) {
    Object.assign(this.getData, {
      list: this.getData.list.map((item, index) => {
        let questionDetail = item.questionDetail;
        if (this.currentTopic == index) {
          return {
            ...item,
            questionDetail: {
              ...questionDetail,
              minorLists: questionDetail.minorLists.map((el, key) => {
                let type = el.type;
                if (this.currentTopicItem == key) {
                  if (status) {
                    type = type == 0 ? type : 1;
                  } else {
                    type = type == 0 ? 1 : 0;
                  }
                } else {
                  void null;
                }
                return { type };
              })
            }
          };
        } else {
          return item;
        }
      })
    });
  },
  // 判断是否走暂存
  dealCache(id) {
    let stagingInfo = this.currentValue["stagingInfo"];
    if (stagingInfo) {
      let correctionAudioId = stagingInfo["correctionAudioId"];
      correctionAudioId = correctionAudioId
        ? JSON.parse(correctionAudioId)
        : [];
      if (correctionAudioId.length) {
        return id == correctionAudioId[0];
      } else {
        return false;
      }
    } else {
      return false;
    }
  },
  // 处理当前audio是否是当前item音频
  dealActiveAudio(value, id) {
    let correctionAudio = this.currentValue["correctionAudio"],
      status = correctionAudio ? correctionAudio[0] == value : false;
    if (id && this.dealCache(id)) {
      return this.dealCache(id);
    } else {
      return status;
    }
  },
  // 处理大当前选中image
  dealActiveImage(id) {
    return this.getData.list[this.currentTopic]["correctionImage"].includes(id);
  }
};

let methods = {
  ...regexp,
  ...emit,
  ...deal,
  // 设置教研解析
  setTextEditor(description) {
    let { useMathEditor, mathAnalyTxt } = description;
    if (useMathEditor) {
      this.$refs.mathTextEditor.setValue(mathAnalyTxt);
    } else {
      void null;
    }
  },
  // 选择备课图片
  changePrepareImage(value) {
    this.trackCommon("bees_pc_web_correction_operationarea_picture");
    let currentImages = this.getData.list[this.currentTopic]["correctionImage"],
      { id, fileUrl } = value,
      checked = currentImages.includes(id);
    // 给白板添加备课图片
    if (checked) {
      this.delPrepareImage(id);
      if (this.checkImageList.length) {
        let img;
        for (let i = 0; i < this.checkImageList.length; i++) {
          if (this.checkImageList[i].id === id) {
            img = this.checkImageList[i].imgObj;
            this.checkImageList.splice(i, 1);
            break;
          }
        }
        this.$refs.decorator.removeCustomImg(img);
      }
    } else {
      this.addPrepareImage(id);
      this.urlToBase64(fileUrl).then((base64) => {
        this.$refs.decorator.insertCustomImg(base64, id).then((imgObj) => {
          this.checkImageList.push({ id, imgObj });
        });
      });
    }
  },
  // url转base64
  urlToBase64(url) {
    return new Promise((resolve, reject) => {
      let canvas = document.createElement("canvas"),
        ctx = canvas.getContext("2d"),
        img = new Image();
      img.crossOrigin = "Anonymous";
      img.src = url;
      img.onload = () => {
        canvas.width = img.width;
        canvas.height = img.height;
        ctx.drawImage(img, 0, 0, img.width, img.height);
        let dataUrl = canvas.toDataURL("image/jpeg");
        canvas = null;
        resolve(dataUrl);
      };
    });
  },
  // 添加备课图片
  addPrepareImage(id) {
    this.getData.list[this.currentTopic]["correctionImage"].push(id);
  },
  // 删除备课图片
  delPrepareImage(id) {
    let currentImages = this.getData.list[this.currentTopic]["correctionImage"];
    currentImages = currentImages.filter((currentImage) => currentImage != id);
    this.getData.list[this.currentTopic]["correctionImage"] = currentImages;
  },
  // 保存音频
  saveAudio() {
    let { lessonId, courseId } = this.$route.query;
    let data = this.getData.list.map((value) => {
      let { id } = value.questionDetail;
      return {
        courseId,
        lessonId,
        questionId: id,
        prepareList: value.prepareList
      };
    });
    this.postReplace(data);
  },
  // 插入音频到当前数据
  addFirstUrl(value) {
    if (this.typeRecord) {
      // 备课语音
      this.currentValue.prepareList.unshift(value);
      this.saveAudio();
    } else {
      // 现场语音
      this.textButtomDisableStatus = false;
      this.currentBlob = null;
      this.textButtonStatus = false;
      this.currentValue.currentScenes.shift();
      this.currentValue.currentScenes.unshift(value);
    }
  },
  // 上传cdn
  uploadFile(value) {
    let upload = new Upload({
        file: [value]
      }),
      self = this;
    upload.more({
      result(err, data) {
        // 上传完毕返回结果
        if (err) {
          console.log("上传失败", err);
          self.$message.error(SAVE_ERROR_RETRY);
          self.textButtomDisableStatus = false;
        } else {
          let files = Object.entries(data).map((item) => ({
            fileUrl: item[1].url,
            fileName: item[0],
            fileType: 0,
            id: item.lastModifiedDate
          }));
          let file = files.shift();
          self.addFirstUrl(file);
        }
      }
    });
  },
  // 点击录制语音
  recordButtom(type) {
    if (true) {
      let length = 0;
      if (type) {
        this.trackCommon("bees_pc_web_correction_operationarea_voiceplan");
        length = this.currentValue.prepareList.filter(
          (item) => item.fileType == 0
        ).length;
      } else {
        this.trackCommon("bees_pc_web_correction_operationarea_nowvoice");
        length = this.currentValue.currentScenes.length;
      }
      if (length >= 10) {
        this.$message({
          message: "每题最多上传10条语音哦",
          type: "warning"
        });
      } else {
        this.typeRecord = type;
        this.recordStatus = true;
      }
    } else {
      void null;
    }
  },
  // 选择语音并且播放
  changeAudioUrl(url, id) {
    this.trackCommon("bees_pc_web_correction_operationarea_voice");
    let correctionAudio = [""],
      stagingInfo = this.currentValue["stagingInfo"],
      correctionAudioId =
        stagingInfo && stagingInfo["correctionAudioId"]
          ? JSON.parse(stagingInfo["correctionAudioId"])
          : [""];
    if (stagingInfo) {
      this.currentValue["stagingInfo"]["correctionAudioId"] = JSON.stringify([
        ""
      ]);
    } else {
      void null;
    }
    if (this.dealActiveAudio(url)) {
      // 点击当前音频
      correctionAudio = [""];
      correctionAudioId = [""];
      pause();
    } else {
      correctionAudio = [url];
      if (id) {
        correctionAudioId = [id];
      } else {
        void null;
      }
    }
    Object.assign(this.getData.list[this.currentTopic], {
      correctionAudio,
      correctionAudioId
    });
  },
  // 播放语音
  audioFn(url) {
    if (audioStatus()) {
      play(url);
    } else {
      pause();
    }
  },
  // 清除评语内容
  clearTeacher() {
    this.review.selectValue = "";
    this.review.textArea = "";
  },
  // 关闭评语列表
  closeEdit() {
    this.editRemarkData = EditRemark.empty({
      status: false
    });
  },
  // 关闭编辑评语
  closeEditChange() {
    this.editChangeData = EditChange.empty({
      status: false
    });
  },
  // 新版打点方法
  newTrackCommon(type, duration, netspeed, size) {
    this.$Track.trigger("style-tutor", type, () => {
      const { lessonId, courseId, accountId } = this.$route.query;
      let obj = {
        student_id: accountId,
        course_id: courseId,
        lesson_id: lessonId,
        teacher_id: Cookie.get("counselorId")
      };
      if (duration) {
        return Object.assign(
          {},
          obj,
          { duration },
          { size: size || null },
          { netspeed: netspeed || null }
        );
      }
      return obj;
    });
  },
  // 打点公共方法
  trackCommon(type) {
    let ntype = `${type}_new`;
    this.$Track.click("style-tutor", ntype, () => {
      let { lessonId, courseId, accountId, onlyUndo } = this.$route.query;
      return {
        student_id: accountId,
        course_id: courseId,
        onlyUndo: onlyUndo,
        lesson_id: lessonId,
        teacher_id: Cookie.get("counselorId")
      };
    });
  },
  // 点击评语选择框
  clikeRemark() {
    this.trackCommon("bees_pc_web_correction_operationarea_comment");
  },
  // 编辑评语
  editRemark() {
    this.trackCommon("bees_pc_web_correction_operationarea_editorcomment");
    let { options } = this.review;
    this.editRemarkData = EditRemark.empty({
      status: true,
      lists: options
    });
  },
  // 选择切换批改作业还是历史提交
  chooseCheck(event, key) {
    let name = event.currentTarget.name;
    if (this[key] === name) {
      void null;
    } else {
      this[key] = name;
    }
  },
  // 选择大题
  chooseTopic(index, type = false) {
    this.currentTopic = index;
    if (!type) {
      this.$refs.decorator.switchTo(index);
    }
  },
  // 选择小题
  chooseItem(index) {
    this.currentTopicItem = --index;
    this.dealTopicItem(this.currentTopic, true);
  },
  // 判断题目
  decideTopic() {
    if (this.currentMinorStatus) {
      this.dealTopicItem();
      this.dealTopicFa(this.currentTopic);
    } else {
      this.dealTopic(this.currentTopic, true);
    }
  },
  // loading状态
  fullLoading(status = true) {
    if (status) {
      this.loading = this.$loading({
        lock: true,
        text: CORRECTION,
        spinner: "el-icon-loading",
        background: "rgba(0, 0, 0, 0.7)"
      });
    } else {
      this.loading.close();
    }
  },
  // 获取下一条学生数据
  async getOneList(params) {
    let res = await api.getOneList({
      ...params,
      pageSize: 1
    });
    if (res) {
      let { lessonId, courseId, studentId } = res;
      let { onlyUndo } = this.$route.query;
      // 批改端过渡web灰度counselorId
      let counselorIdList = await api.webcanvas();
      let isCOunselorId = counselorIdList.some((item) => {
        return item == Cookie.get("counselorId");
      });
      // 如果是灰度counselorId
      if (isCOunselorId) {
        window.location.replace(
          `/tutor/correctionworkh5/index?${stringfiy({
            lessonId,
            courseId,
            onlyUndo,
            accountId: studentId
          })}`
        );
      } else {
        window.location.replace(
          `/tutor/correctionwork/index?${stringfiy({
            lessonId,
            courseId,
            onlyUndo,
            accountId: studentId
          })}`
        );
      }
    } else {
      let { onlyUndo, courseId } = this.$route.query;
      this.$router.replace({
        path: "/correctionlesson/index",
        query: {
          onlyUndo,
          courseId
        }
      });
    }
  },
  // 获取学生信息
  async getAccount(params) {
    let res = await api.getAccount(params);
    this.getaAccountData = res;
  },
  // 获取批改作业内容
  async postDetail(params) {
    let netApi =
      +this.$route.query.type === 1 ? api.postDoneDetail : api.postWaitDetail;
    netApi(params)
      .then((res) => {
        this.getData = res;
        this.review.textArea = res.review ? res.review : "";
        if (this.dealNativeUnHistory()) {
          // 打点
          let oImg;
          res.list.forEach(async (item, i) => {
            let timeStart, timeEnd;
            let bytes = await this.dataURLtoFile(item.images);
            let size = "";
            if (bytes >= 1048576) {
              size = (bytes / 1048576).toFixed(2) + "MB";
            } else {
              size = (bytes / 1024).toFixed(2) + " KB";
            }
            let oImg = new Image();
            oImg.crossOrigin = "Anonymous";
            timeStart = Date.now();
            oImg.onload = () => {
              timeEnd = Date.now();
              if (!i) {
                this.newTrackCommon(
                  "bees_pc_web_correction_all_download",
                  timeEnd - this.pageLoadeTime,
                  this.netSpeed(),
                  size
                );
                this.loadingPage.close();
              }
              this.newTrackCommon(
                "bees_pc_web_correction_picture_download_success",
                timeEnd - timeStart,
                this.netSpeed(),
                size
              );
            };
            oImg.onerror = () => {
              timeEnd = Date.now();
              if (!i) {
                this.newTrackCommon(
                  "bees_pc_web_correction_all_download",
                  timeEnd - this.pageLoadeTime,
                  this.netSpeed(),
                  size
                );
                this.loadingPage.close();
              }
              this.newTrackCommon(
                "bees_pc_web_correction_picture_download_fail",
                timeEnd - timeStart,
                this.netSpeed(),
                size
              );
            };
            oImg.src = item.images;
          });
          res.list = res.list.map((item) => {
            // item.images = item.images.replace('//img.','//imgx.').replace('.com/','.com/img/') + '?format,webp'
            this.imageList.push(item.images);
            return {
              ...item,
              tid: item.id
            };
          });
        }
        this.dealTopic(this.currentTopic);
      })
      .catch((e) => {
        this.loadingPage.close();
        this.$message.error(
          "查询作业接口报错：" + e.message + "参数：" + JSON.stringify(params)
        );
        this.newTrackCommon("bees_pc_web_correction_all_download_fail");
      });
  },
  // 网速
  netSpeed() {
    if (navigator.userAgent.indexOf("Chrome") > -1) {
      return `${((navigator.connection.downlink * 1024) / 8).toFixed(2)}KB/s`;
    }
    return null;
  },
  // 获取url cdn图片大小
  dataURLtoFile(dataurl, filename) {
    return new Promise((resolve, reject) => {
      fetch(dataurl)
        .then(function(res) {
          return res.blob();
        })
        .then(function(data) {
          resolve(data.size);
        })
        .catch((_) => {
          reject(dataurl);
        });
    });
  },
  // 获取可否提交
  isTrueSubmit(value) {
    let boolean = value.some((item) => {
      let { questionDetail } = item;
      // 切换全部大题题号即可以批改完成，判错认为错，未判错认为对
      if (questionDetail.minorCount) {
        questionDetail.minorLists = questionDetail.minorLists.map((list) => {
          if (list.type == 99) list.type = 1;
          return list;
        });
      }
      return item.type == 99;
    });
    if (boolean) {
      // 有未填写
      this.$message.error(HOME_HAVE_EMPTY);
      return false;
    } else {
      return true;
    }
  },
  // 处理提交数据
  dealPostBatchData(values) {
    let { accountId, counselorId } = this.user,
      { lessonId, courseId } = this.$route.query;
    const reviewList = this.getData.list.map((item, index) => {
      let normal = {
          counselorAccountId: accountId,
          counselorId: counselorId
        },
        { homeworkCorrectionId, id, type, questionDetail } = item,
        value = values.find((value) => value.tid == id),
        correctionImages = value.url;
      type = questionDetail.minorCount
        ? questionDetail.minorLists.map((list) => list.type)
        : [type];
      return {
        ...normal,
        correctionImages: JSON.stringify([correctionImages]),
        correctionAudio: JSON.stringify(item.correctionAudio),
        stagingInfo: {
          correctionAudioId: JSON.stringify(item.correctionAudioId)
        },
        homeworkCorrectionId,
        id,
        isRightArray: type
      };
    });
    return {
      lessonId,
      courseId,
      review: this.review.textArea,
      startTime: this.cacheTime,
      endTime: new Date().getTime(),
      reviewList
    };
  },
  // 暂存
  async postStaging(values) {
    let params = this.dealPostBatchData(values);
    let status = await api.postStaging({
      ...params,
      submitId: this.getData.submitId
    });
    this.fullLoading(false);
    if (status) {
      let { lessonId, courseId } = params;
      this.$router.replace({
        path: "/correctionawait/index",
        query: {
          lessonId,
          courseId,
          onlyUndo: 0
        }
      });
    } else {
      this.$message.error("暂存失败");
    }
  },
  // 提交批改作业
  async postBatch(values, timeStart) {
    let params = this.dealPostBatchData(values);
    // let time
    let status = await api.postBatch(params);
    if (status) {
      let timeEnd = Date.now();
      this.newTrackCommon("bees_pc_web_correction_submit", timeEnd - timeStart);
      let { lessonId, courseId } = params;
      this.fullLoading(false);
      await this.getOneList({
        lessonId,
        courseId,
        homeworkStatus: 0
      });
    } else {
      // 审批失败
      this.fullLoading(false);
      // this.c.hiddenWhite(1);
      this.$message.error(CORRECTION_POST_ERROR);
    }
  },
  // 暂存
  cacheSubmit() {
    this.trackCommon("bees_pc_web_correction_operationarea_stop");
    this.fullLoading();
    this.subimtStatus = false;
    let modifiedImages = this.$refs.decorator.exportImageList();
    let data;
    Promise.all(modifiedImages).then((res) => {
      data = res.map((d, i) => {
        return {
          tid: this.getData.list[i].tid,
          url: d
        };
      });
      this.postStaging(data);
    });
  },
  // 提交
  async submit() {
    let timeStart;
    if (this.isTrueSubmit(this.getData.list)) {
      timeStart = Date.now();
      this.$Track.click("style-tutor", "confirm-correct", () => {
        return {
          list: JSON.stringify(this.getData.list)
        };
      });
      this.trackCommon("bees_pc_web_correction_operationarea_correct");
      this.subimtStatus = true;
      this.fullLoading();
      let modifiedImages = this.$refs.decorator.exportImageList();
      let data;
      Promise.all(modifiedImages).then((res) => {
        data = res.map((d, i) => {
          return {
            tid: this.getData.list[i].tid,
            url: d
          };
        });
        this.postBatch(data, timeStart);
      });
    } else {
      void null;
    }
  },
  // 获取教师评语
  async getTextList(params = {}) {
    let res = await api.getTextList({
      ...params,
      pageSize: 20
    });
    this.review.options = res;
  },
  // 删除评语
  async postTextDelete(params) {
    let res = await api.postTextDelete(params);
    if (res) {
      await this.getTextList();
      this.editRemark();
      this.clearTeacher();
      this.$message({
        message: DELETE_SUCCESS,
        type: "success"
      });
    } else {
      this.$message.error(DELETE_ERROR);
    }
  },
  // 保存评语
  async postSave(params) {
    let res = await api.postSave(params);
    if (res) {
      await this.getTextList();
      this.closeEditChange();
      this.closeEdit();
      this.changeSelect();
      this.$message({
        message: SAVE_SUCCESS,
        type: "success"
      });
    } else {
      this.$message.error(SAVE_ERROR);
    }
  },
  // 保存音频
  async postReplace(params) {
    let res = await api.postReplace(params);
    if (res.status) {
      this.textButtomDisableStatus = false;
      this.currentBlob = null;
      this.textButtonStatus = false;
      this.$message({
        type: "success",
        duration: 2000,
        message: res.message
      });
    } else {
      this.textButtomDisableStatus = false;
      this.$message({
        type: "error",
        duration: 2000,
        message: res.message
      });
    }
  },
  //添加删除图片
  showPreClassImg(data) {
    this.c.showPreClassImg(data);
  },
  // 图片进行了切换
  dealIndexChange(currIndex) {
    this.chooseTopic(currIndex, true);
  },
  filterCoustomImg(arr) {
    // 存在当前画布中的img对象arr
    let canvasSelected =
      arr.length === 0
        ? []
        : arr.map((d) => {
            return {
              ...d,
              id: Number(d.id.split("-")[1])
            };
          });
    if (canvasSelected.length === 0) {
      // 全清空
      this.getData.list[this.currentTopic]["correctionImage"] = [];
      this.checkImageList.forEach((d) => this.dealActiveImage(d.id));
      this.checkImageList = [];
      return;
    } else {
      this.checkImageList = canvasSelected;
      this.getData.list[this.currentTopic][
        "correctionImage"
      ] = this.checkImageList.map((d) => d.id);
      // 关联样式
      this.checkImageList.forEach((d) => this.dealActiveImage(d.id));
    }
  }
};

let watch = {
  // 监听当前改动
  currentTopic(value) {
    if (this.currentValue["questionDetail"]) {
      this.setTextEditor(this.currentValue.questionDetail.description);
      this.dealTopic(value);
    }
  }
};

let computed = {
  // 处理文字过长
  options() {
    return this.review.options.map((item) => {
      let length = String(item.text).length,
        text = length >= 20 ? `${item.text.slice(0, 20)}...` : item.text;
      return {
        ...item,
        text
      };
    });
  },
  // 当前数据
  currentValue() {
    if (this.getData.list) {
      return this.getData.list[this.currentTopic];
    } else {
      return new Object();
    }
  },
  // 当前是否存在批改内容
  currentCorrection() {
    if (this.getData.list) {
      return this.getData.list.length ? true : false;
    } else {
      return true;
    }
  },
  // 小题是否存在
  currentMinorStatus() {
    return Boolean(this.currentValue.questionDetail.minorCount);
  },
  // 大小题 判错文案
  currentText() {
    if (this.currentMinorStatus) {
      return "小题判错";
    } else {
      return "大题判错";
    }
  },
  // 是否是查看
  isHistory() {
    let { type } = this.$route.query;
    return Boolean(type);
  }
};
export default {
  name: "correctionWorkh5",
  created() {
    this.loadingPage = this.$loading({
      lock: true,
      text: "加载作业中，请稍后...",
      spinner: "el-icon-loading",
      background: "rgba(0, 0, 0, 0.7)"
    });
    let { lessonId, courseId, accountId, submitId } = this.$route.query;
    this.getAccount({
      accountId
    });
    this.postDetail({
      lessonId,
      courseId,
      accountId,
      submitId
    });
    this.getTextList();
    if (this.currentValue && this.currentValue["questionDetail"]) {
      this.setTextEditor(this.currentValue.questionDetail.description);
    } else {
      void null;
    }
  },
  destroyed() {
    if (this.loadingPage) {
      this.loadingPage.close();
      this.loadingPage = null;
    }
  },
  watch,
  computed,
  data() {
    return {
      pageLoadeTime: Date.now(),
      checkImageList: [],
      imageList: [],
      config: {
        colorList: ["#ff4400", "#00bdfc", "#faff00", "#7c7c6f", "#fefcf0"],
        defaultPencilSize: 20,
        pencilSizeList: [4, 8, 20, 40],
        defaultPencilColor: "#ff4400",
        defaultTextSize: 40,
        textSizeList: [20, 40, 80, 160],
        defaultTextColor: "#ff4400",
        operateDisplay: {
          save: false,
          emoji: SVGComponentTransferFunctionElement,
          rotate: true,
          mouse: true
        },
        autoSave: true,
        emojiList: emojiList
      },
      CORRECT_WORK,
      HOISTORY_WORK,
      attribute: CORRECT_WORK,
      subimtStatus: true,
      bottomMargin: 50,
      bodyStyle: {
        padding: "10px"
      },
      canvas: {
        status: false,
        width: 100,
        height: 0
      },
      review: {
        options: [], // 评语列表
        selectValue: "", // 选择评语
        textArea: "" // 输入评语
      },
      currentTopic: 0, // 当前大题
      currentTopicItem: 0, // 当前小题
      getaAccountData: {}, // 获取学生数据
      getData: {}, // 获取批改作业数据
      cacheImageArr: [], //需要提交的图片
      user: I.doaction(I.current).user,
      cacheTime: new Date().getTime(), // 缓存时间
      loading: null, // loading
      loadingPage: null,
      editRemarkData: {
        status: false
      }, // 总评语
      editChangeData: {
        status: false
      }, // 编辑评语
      recordStatus: false,
      textButtonStatus: false,
      typeRecord: 0,
      textButtomDisableStatus: false, // 当前命名状态
      currentBlob: null //当前音频blob
    };
  },
  methods,
  components
};
</script>

<style lang="less" scoped>
@import url(../../css/variable.less);
@import url(../../css/classStyle.less);
.correctionworkh5-cont {
  display: flex;
  flex-direction: column;
  width: 100%;
  height: 100%;
  overflow: hidden;
  .correctionHeader {
    padding: 0 15px;
    box-sizing: border-box;
    background: #ffffff;
    border-bottom: 1px solid @base_gary;
    overflow: hidden;
    .el-button.focus {
      color: #409eff;
      border-color: #c6e2ff;
      background-color: #ecf5ff;
      cursor: pointer;
    }
  }

  .correctionContent {
    display: flex;
    flex-direction: column;
    flex: 1;
    width: 100%;
    padding: 5px;
    box-sizing: border-box;
    background: #ffffff;
    .correctionCanvas {
      &:after {
        clear: both;
      }
      width: 100%;
      .image-decorator-wrap {
        float: left;
        width: calc(100% - 300px);
        height: calc(100vh - 200px);
      }
      .correctionEdit {
        float: left;
        position: relative;
        width: 300px;
        height: calc(100vh - 160px);
        overflow: auto;
        .recordBdBox,
        .textButtonBdBox {
          position: fixed;
          top: 97px;
          right: 0;
          z-index: 99;
          width: 21.5vw;
          height: 100%;
        }
        .topic {
          display: flex;
          flex-wrap: wrap;
          .topicTitle {
            font-size: 18px;
            margin-right: 15px;
          }
          .topicContent {
            flex: 1;
            font-size: 0;
            .topicButton {
              padding: 8px 12px;
              margin: 0 5px 10px;
            }
          }
        }
        .topicControl {
          display: flex;
          font-size: 18px;
          .topicTitle {
            margin-right: 20px;
            opacity: 0;
          }
        }
        .titleBox {
          display: flex;
        }
        .cardText {
          font-size: 12px;
          margin-bottom: 10px;
        }

        .math-editor-box {
          overflow-y: auto;
        }
        .math-editor-c {
          overflow-y: auto;
        }
        .cardButtom {
          margin-left: 10px;
        }
        .prepareBox {
          display: flex;
          flex-wrap: wrap;
          width: 100%;
          li {
            margin-bottom: 5px;
            margin-right: 5px;
          }
        }
        .teacherRemark {
          position: relative;
          line-height: 40px;
          .teacherTitle {
            line-height: 40px;
          }
          .teacherButton {
            vertical-align: middle;
          }
        }
        .buttonBox {
          position: fixed;
          text-align: center;
          bottom: 10px;
          right: 60px;
        }
      }
    }
    .notHomework {
      height: 100%;
      font-size: 30px;
      text-align: center;
      margin-top: 10%;
    }
  }
  .nativeBox {
    padding: 20px;
    box-sizing: border-box;
    h1 {
      font-size: 20px;
      margin-bottom: 10px;
    }
    p {
      font-size: 16px;
    }
  }
}
.el-select-dropdown {
  right: 0 !important;
  max-width: 20% !important;
}
</style>
