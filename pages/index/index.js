// pages/index/index.js
import request from '../utils/request'
Page({

  /**
   * 页面的初始数据
   */
  data: {
    bannerList: [], //轮播图数据
    recommendList: [],   //推荐歌单
    topList: []    //排行榜数据
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: async function (options) {
    // wx.request({
    //   url:"http://localhost:3000/banner",
    //   data:{type:2},
    //   success:(res) =>{
    //     console.log('请求成功',res);
    //   },
    //   fail:(err)=>{
    //     console.log('请求失败',err);
    //   }
    // })

    let bannerListData = await request('/banner', { type: 2 })
    this.setData({
      bannerList: bannerListData.banners
    })

    //获取推荐歌单数据
    let recommendListData = await request('/personalized', { limit: 10 })
    this.setData({
      recommendList: recommendListData.result
    })
    // 获取排行榜数据
/*
* /toplist 获取所有排行榜单
* detailList 歌单详情
* */
   let allTopListData = await request('/toplist')
   let topList = allTopListData.list.slice(0, 4)
   let topListDetail = []
   for (let item of topList) {
     let detailList = await request(`/playlist/detail?id=${item.id}`, { limit: 10 })
     topListDetail.push({name: detailList.playlist.name, tracks: detailList.playlist.tracks.slice(0, 3)})
     this.setData({
       topList: topListDetail
     })
   }

   /*
      需求分析：
          1.需要根据id的值获取对应的数据
          2.id的取值范围是0-20，我们需要0-4
          3.需要发送5次请求
    */
    // let index = 0
    // let resultArr = []
    // while (index < 5) {
    //   let topListData = await request('/toplist', { id: index++ })
    //   //splice(会修改原数组，可以对指定的数组进行增删改查，slice（不会修改原数组）)
    //   let topListItem = { name:topListData.name, tracks: topListData.playlist.tracks.slice(0, 3) }
    //   resultArr.push(topListItem)
    //   //不需要等待五次请求全部结束才更新，用户体验较好，但是渲染次数会多一些，
    //   this.setData({
    //     topList: resultArr
    //   })
    // }
    //  更新toplist的状态值 ,放在此处更新会导致发送请求的过程中页面长时间白屏，用户体验差
    // this.setData({
    //   topList:resultArr
    // })
  },
  // 跳转到recommendSong页面的回调
  toRecommendSong(){
    wx.navigateTo({
      url: '/pages/recommendSong/recommendSong',
    })
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