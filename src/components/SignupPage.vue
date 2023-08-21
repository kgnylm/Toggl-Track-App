<template>
  <div class="signup-container">
    <div class="signup-card">
      <h2>Toggl Track - Sign Up</h2>
      <form>
        <div class="form-box">
          <div class="form-group">
            <label for="name">Name:</label>
            <input type="text" id="name" v-model="name" required />
          </div>
          <div class="form-group">
            <label for="surname">Surname:</label>
            <input type="text" id="surname" v-model="surname" required />
          </div>
          <div class="form-group">
            <label for="email">E-mail:</label>
            <input type="email" id="email" v-model="email" required />
          </div>
          <div class="form-group">
            <label for="password">Password:</label>
            <input type="password" id="password" v-model="password" required />
          </div>
          <div class="form-group">
            <label for="confirmPassword">Confirm Password:</label>
            <input
              type="password"
              id="confirmPassword"
              v-model="confirmPassword"
              required
            />
            <p class="not-match" v-if="showFieldError">
              *Please fill all the fields!
            </p>
            <p class="not-match" v-if="showPasswordError">
              *Passwords do not match!
            </p>
            <p class="not-match" v-if="alreadyRegistered">
              *{{ alreadyRegisteredMessage }}
            </p>
          </div>
        </div>
        <button class="signup-button" @click.prevent="signup">Sign Up</button>
        <p class="login-link">
          Do you have an account?
          <span class="login-text" @click="navigateToSignIn">Sign In</span>
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
      name: "",
      surname: "",
      email: "",
      password: "",
      confirmPassword: "",
      showFieldError: false,
      showPasswordError: false,
      alreadyRegistered: false,
      alreadyRegisteredMessage: "",
    };
  },
  methods: {
    async signup() {
      if (
        this.name === "" ||
        this.surname === "" ||
        this.email === "" ||
        this.password === "" ||
        this.confirmPassword === ""
      ) {
        this.showFieldError = true;
        this.showPasswordError = false;
        return;
      } else {
        this.showFieldError = false;
      }

      if (this.password !== this.confirmPassword) {
        this.showPasswordError = true;
        return;
      } else {
        this.showPasswordError = false;
      }

      try {
        const { data, error } = await supabase.auth.signUp({
          email: this.email,
          password: this.password,
        });
        console.log(data);

        if (error) {
          this.alreadyRegistered = true;
          this.alreadyRegisteredMessage = error.message;
        } else if (this.checkPassword()) {
          const { data: insertData, error: insertError } = await supabase
            .from("User")
            .insert([
              {
                id: data.user.id,
                name: this.name,
                surname: this.surname,
                email: this.email,
              },
            ]);

          console.log(insertData);
          if (insertError) {
            alert(insertError.message);
          } else {
            const { data: userData } = await supabase
              .from("User")
              .select()
              .eq("email", this.email);
            console.log(userData);
            localStorage.setItem(
              "user",
              JSON.stringify({
                id: data.user.id,
                name: this.name,
                surname: this.surname,
                email: this.email,
              })
            );
            this.$router.push("/");
          }
        }
      } catch (error) {
        alert(error.message);
      }
    },
    checkPassword() {
      if (this.password !== this.confirmPassword) {
        return false;
      }
      return true;
    },
    checkInputs() {
      if (
        this.name === "" ||
        this.surname === "" ||
        this.email === "" ||
        this.password === "" ||
        this.confirmPassword === ""
      ) {
        return false;
      }
      return true;
    },
    navigateToSignIn() {
      this.$router.push("/login");
    },
  },
};
</script>

<style>
.signup-container {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100vh;
  background-color: #fef9f7;
  margin: 0;
  padding: 0;
}

.signup-card {
  background-color: #fff;
  border-radius: 5px;
  padding: 20px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  width: 300px;
}

.signup-card h2 {
  text-align: center;
  margin-bottom: 20px;
  color: #a84c94;
}

.form-box {
  display: flex;
  flex-direction: column;
}

.form-group {
  margin-bottom: 15px;
}

label {
  display: block;
  margin-bottom: 5px;
  color: #333;
}

.not-match {
  color: #a84c94;
  font-size: 16px;
  font-weight: bold;
  margin-top: 5px;
}

input {
  width: 100%;
  padding: 8px;
  font-size: 14px;
  border: 1px solid #ccc;
  border-radius: 5px;
}

.signup-button {
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
.login-link {
  text-align: center;
  color: #333;
  margin-top: 10px;
}

.login-text {
  color: #a84c94;
  cursor: pointer;
}
</style>
