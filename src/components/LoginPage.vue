<template>
  <div class="login-container">
    <div class="login-card">
      <h2>Toggl Track - Sign In</h2>
      <form>
        <div class="form-group">
          <label for="email">E-mail:</label>
          <input type="email" id="email" v-model="email" required />
        </div>
        <div class="form-group">
          <label for="password">Password:</label>
          <input type="password" id="password" v-model="password" required />
        </div>
        <p class="not-match" v-if="isInternalError">
          *Something Went Wrong or Invalid Cretendials!
        </p>
        <button class="login-button" @click.prevent="login">Sign In</button>
        <p class="signup-link">
          Don't have an account yet?
          <span class="signup-text" @click="navigateToSignup">Sign Up</span>
        </p>
      </form>
    </div>
  </div>
</template>

<script>
import supabase from "../../supabase/supabase";
export default {
  data() {
    return {
      email: "",
      password: "",
      isSuccess: null,
      isInternalError: false,
    };
  },
  methods: {
    async login() {
      try {
        const data = await supabase.auth.signInWithPassword({
          email: this.email,
          password: this.password,
        });
        const user = await supabase
          .from("User")
          .select("*")
          .eq("id", data.data.user.id);
        if (data.data.user) {
          this.isSuccess = true;
          localStorage.setItem(
            "user",
            JSON.stringify({
              id: data.data.user.id,
              name: user.data[0].name,
              surname: user.data[0].surname,
              email: data.data.user.email,
            })
          );
          this.$router.push("/");
        }
      } catch (error) {
        this.isInternalError = true;
      }
    },
    navigateToSignup() {
      this.$router.push("/signup");
    },
  },
};
</script>

<style>
html,
body,
#app {
  height: 100%;
  margin: 0;
  padding: 0;
}
.login-container {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100vh;
  background-color: #fef9f7;
  margin: 0;
  padding: 0;
}

.login-card {
  background-color: #fff;
  border-radius: 5px;
  padding: 20px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  width: 300px;
}

.login-card h2 {
  text-align: center;
  margin-bottom: 20px;
  color: #a84c94;
}

.form-group {
  margin-bottom: 15px;
}

label {
  display: block;
  margin-bottom: 5px;
  color: #333;
}

input {
  width: 70%;
  padding: 8px;
  font-size: 14px;
  border: 1px solid #ccc;
  border-radius: 5px;
  margin-left: -2.5%;
  background-color: rgba(168, 76, 148, 0.2);
  color: #000000;
}

.login-button {
  display: block;
  width: 30%;
  padding: 10px;
  font-size: 16px;
  font-weight: bold;
  border: none;
  border-radius: 5px;
  cursor: pointer;
  color: #fff;
  background-color: #a84c94;
  margin: 0 auto;
}
.signup-link {
  text-align: center;
  color: #333;
  margin-top: 10px;
}

.signup-text {
  color: #a84c94;
  cursor: pointer;
}
.not-match {
  color: #a84c94;
  font-size: 16px;
  margin-top: 5px;
}
</style>
