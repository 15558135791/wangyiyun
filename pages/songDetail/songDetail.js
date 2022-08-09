// pages/songDetail/songDetail.js
import PubSub from 'pubsub-js';
import request from '../utils/request'
import moment from 'moment';
const appInstance = getApp()
Page({

  /**
   * 页面的初始数据
   */
  data: {
    isPlay: false, //音乐是否播放
    song: {},    //歌曲详情对象id
    musicId: '',  //音乐的id
    musicLink: '',   //音乐的链接
    currentTime: '00:00',   //实时时间
    durationTime: '00:00',   //总时长
    currentWidth: 0,     //实时进度条的宽度
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad(options) {
    // 接收点击音乐的id
    let musicId = options.musicId
    this.setData({
      musicId
    })
    // 获取音乐详情
    this.getMusicInfo(musicId)
    /*
       问题：  如果用户操作系统的控制音乐播放/暂停的按钮。页面不知道，导致页面显示是否播放的状态和真实的音乐播放状态不一致
          解决方案：
             1.通过控制音频的实例backgroundAudioManager 去监视音乐播放的实例 
    */
    //  判断当前页面音乐是否在播放
    if (appInstance.globalData.isMusicPlay && appInstance.globalData.musicId === musicId) {
      this.setData({
        isPlay: true
      })
    }
    // 创建控制音乐播放的实例
    this.backgroundAudioManager = wx.getBackgroundAudioManager()

    // 监听音乐的播放/暂停/停止事件
    // 监听背景音频播放事件
    this.backgroundAudioManager.onPlay(() => {
      this.changePlayState(true)

      // 修改全局的音乐播放状态
      appInstance.globalData.musicId = musicId
    })

    // 监听背景音频暂停事件
    this.backgroundAudioManager.onPause(() => {
      this.changePlayState(false)
    })

    // 监听背景音乐的停止事件
    this.backgroundAudioManager.onStop(() => {
      this.changePlayState(false)
    })

    // 监听音乐播放的自然结束
    this.backgroundAudioManager.onEnded(() => {
      // 发布消息数据给recommendSong页面
      PubSub.publish('switchType', 'next')
      // 将实时进度条的长度还原成0
      this.setData({
        currentWidth: 0,    //实时长度
        currentTime: '00:00',    //实时的时间
      })
    })

    // 监听音乐实时播放的进度
    this.backgroundAudioManager.onTimeUpdate(() => {
      // console.log('总时长：', this.backgroundAudioManager.duration);
      // console.log('实时的时长：', this.backgroundAudioManager.currentTime);
      // 格式化实时的时间
      let currentTime = moment(this.backgroundAudioManager.currentTime * 1000).format('mm:ss')
      let currentWidth = this.backgroundAudioManager.currentTime / this.backgroundAudioManager.duration * 450
      this.setData({
        currentTime,
        currentWidth
      })
    })

  },
  // 修改播放状态的功能函数
  changePlayState(isPlay) {
    this.setData({
      isPlay
    })
    // 修改全局的音乐播放状态
    appInstance.globalData.isMusicPlay = isPlay
  },
  // 获取音乐详情的功能函数
  async getMusicInfo(musicId) {
    let songData = await request('/song/detail', { ids: musicId })
    // 获取音乐时长
    let durationTime = moment(songData.songs[0].dt).format('mm:ss');
    this.setData({
      song: songData.songs[0],
      durationTime
    })
    wx.setNavigationBarTitle({
      // 当前歌曲的名称
      title: this.data.song.name
    })
  },
  // 点击播放/暂停的回调
  handleMusicPlay() {
    let isPlay = !this.data.isPlay
    // // 修改是否播放的状态
    // this.setData({
    //   isPlay
    // })
    let { musicId, musicLink } = this.data
    this.musicControl(isPlay, musicId, musicLink)
  },
  // 控制音乐播放/暂停的功能函数
  async musicControl(isPlay, musicId, musicLink) {
    if (isPlay) {//音乐播放
      if (!musicLink) {
        // 获取音乐的链接
        let musicLinkData = await request('/song/url', { id: musicId })
        musicLink = musicLinkData.data[0].url

        this.setData({
          musicLink
        })
      }

      this.backgroundAudioManager.src = musicLink
      this.backgroundAudioManager.title = this.data.song.name
    } else {//暂停音乐
      this.backgroundAudioManager.pause()
    }
  },
  // 点击切歌的回调
  handleSwitch(event) {
    let type = event.currentTarget.id
    // 关闭当前播放的音乐
    this.backgroundAudioManager.stop()

    //订阅来自recommendSong页面的musicId消息
    PubSub.subscribe('musicId', (msg, musicId) => {
      // console.log(musicId);

      // 获取音乐详情信息
      this.getMusicInfo(musicId)
      // 自动播放当前的音乐
      this.musicControl(true, musicId)

      // 取消订阅
      PubSub.unsubscribe('musicId')
    })

    // 发布消息数据给recommendSong页面
    PubSub.publish('switchType', type)
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady() {

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow() {

  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide() {

  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload() {

  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh() {

  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom() {

  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage() {

  }
})