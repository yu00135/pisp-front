const user = {
    namespaced: true,
    state: () => ({
        email:'',
        userName:'',
        phone:'',
        password:'',
        userProfile:'',
        isLogin:false,
        failCount:0,
    }),
    mutations: {
        login(state,data){
            state.email = data.email;
            state.userName = data.userName;
        },
        loginSuccess(state){
            state.islogin = true;
        },
        loginFail (state) {
            state.failCount++
        }
    },
    actions: {
        login(context, value) {
            context.commit('user', value)
        },
        getUser(context){
            return context.state
        },
    },
    getters: {
        doubleCount (state) {
            return state.count * 2
        }
    }
}
export default user
