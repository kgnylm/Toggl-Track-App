<template>
  <div class="app">
    <div class="sidebar">
      <div class="user-info">
        <h2 class="sidebar-h2">{{ user.name }} {{ user.surname }}</h2>
        <h4 class="sidebar-h4">{{ user.email }}</h4>
      </div>
      <div
        v-if="loading"
        class="loading-screen"
        style="display: flex; flex-direction: column; align-items: center"
      >
        <div class="spinner"></div>
        <h3 class="loading-text">Loading projects and tasks...</h3>
      </div>
      <div v-else class="projects">
        <h3 class="sidebar-h3">Projects</h3>
        <h4 v-if="projects.length === 0" class="sidebar-h4">
          There are no projects.
        </h4>
        <div v-else class="projects-grid">
          <div
            v-for="project in projects"
            :key="project.id"
            class="project-card"
          >
            <div class="project-header">
              <div @click="toggleProject(project)" class="project-name">
                <span class="project-marker"></span>
                {{ project.name }}
              </div>
              <button
                @click="deleteProject(project)"
                class="delete-button delete-project-btn"
              >
                <span class="delete-icon">-</span>
              </button>
            </div>
            <ul v-if="project.isProjectOpen" class="project-tasks">
              <li v-if="project.tasks.length === 0">
                <h5 class="no-tasks">There are no tasks for this project.</h5>
              </li>
              <li
                v-else
                v-for="task in project.tasks"
                :key="task.id"
                :class="{
                  'project-task': true,
                  active: currentTask && currentTask.id === task.id,
                }"
              >
                {{ task.name }}-{{ calculateSecondsSideBar(task.totalSeconds) }}

                <button
                  @click="deleteTask(project, task)"
                  class="delete-button delete-task-btn"
                >
                  <span class="delete-icon">-</span>
                </button>
              </li>
            </ul>
          </div>
        </div>
      </div>
      <div v-if="loading === false" class="project-input">
        <input
          class="project-label"
          v-model="newProjectName"
          :disabled="timerRunning"
          placeholder="Project Name"
          @keydown.enter="addNewProject"
        />
        <button
          :disabled="timerRunning"
          @click="addNewProject"
          class="create-button"
        >
          <img src="../assets/crt.png" alt="Create" />
        </button>
      </div>
      <button class="logout-button" @click="logout">
        <img src="../assets/logout.svg" alt="Logout" />
      </button>
    </div>
    <div class="main">
      <div v-if="currentTask">
        <h2>{{ currentTask.name }}</h2>
        <h3 v-if="timerRunning">{{ secondsElapsed }} seconds</h3>
        <h3 v-else-if="taskCompleted">
          {{ completedTask.name }} completed in
          {{ completedTask.seconds }} seconds
        </h3>
        <button @click="stopTask" class="stop-button">
          <img src="../assets/stop.png" alt="Stop" />
        </button>
      </div>
      <div v-else>
        <div v-if="selectedProject">
          <button @click="setSelectedProjectToNull" class="back-button">
            <img src="../assets/back.png" alt="Back" />
          </button>
          <input
            v-model="newTaskName"
            :disabled="timerRunning"
            placeholder="What are you working on?"
            @keydown.enter="startTask"
            class="task-input"
          />

          <button
            :disabled="timerRunning"
            @click="startTask"
            class="start-button"
          >
            <img src="../assets/start.png" alt="Start" />
          </button>
        </div>
        <div v-else>
          <h3>Please select a project:</h3>
          <div>
            <v-icon name="gi-ancient-sword" scale="4" />
          </div>
          <h4 v-if="loading === true">Projects are loading...</h4>
          <h4 v-else-if="projects.length === 0 && loading === false">
            There are no projects. Please create a project.
          </h4>
          <div class="projects-grid">
            <div
              v-for="project in projects"
              :key="project.id"
              class="project-card"
            >
              <label :for="`project_${project.id}`">{{ project.name }}</label>
              <button @click="enterProject(project)" class="select-button">
                <img src="../assets/select.png" alt="Select" />
              </button>
            </div>
            <div class="project-card">
              <label for="newProject">Continue without project</label>
              <button @click="continueWithoutProject" class="select-button">
                <img src="../assets/select.png" alt="Select" />
              </button>
            </div>
          </div>
        </div>
      </div>
      <div class="completed-tasks">
        <h3>Completed Tasks:</h3>
        <h4 v-if="loading === true">Tasks are loading...</h4>
        <h4 v-else-if="completedTasks.length === 0">No completed tasks.</h4>
        <ul v-else>
          <li v-for="(tasks, index) in completedTasks" :key="index">
            <div v-for="task in tasks" :key="task.id" class="completed-tasks">
              <div class="completed-task-name">
                {{ task.name }}
              </div>
              <button class="project-button" @click="openModal('', task)">
                {{ task.project.name }}
              </button>
              <div class="completed-task-details">
                <div class="completed-task-date">
                  {{ formatDate(task.date) }}
                </div>
                <div class="completed-task-start-end">
                  {{ formatTime(task.created_at) }}-{{
                    formatTime(task.finished_at)
                  }}
                </div>
                <div class="completed-task-time">
                  {{ calculateSeconds(task) }}
                </div>
              </div>
            </div>
          </li>
        </ul>
      </div>
    </div>
    <ErrorModal
      :errorMessage="errorModalMessage"
      :isVisible="errorModalVisible"
      @close="closeErrorModal"
    />
    <div class="modal" v-if="modalOpen">
      <div class="modal-content">
        <p>
          Select new project for <b>{{ this.taskforchangetask.name }}:</b>
        </p>
        <div class="button-container">
          <button
            class="project-button"
            v-for="project in justprojects"
            :key="project.id"
            @click="assignProjectSelectedTask(project, this.taskforchangetask)"
          >
            {{ project.name }}
          </button>
          <button
            class="project-button2"
            @click="setProjecttoNullSelectedTask(this.taskforchangetask)"
          >
            Change this task to without project
          </button>
        </div>
        <button @click="modalOpen = false" class="kapat-button">Close</button>
      </div>
    </div>
  </div>
</template>

<script>
import supabase from "../../supabase/supabase";
import ErrorModal from "./ErrorModal.vue";

export default {
  components: {
    ErrorModal,
  },
  data() {
    return {
      projects: [],
      justprojects: [],
      taskforchangetask: null,
      user: null,
      timerRunning: false,
      startTime: null,
      currentTask: null,
      secondsElapsed: 0,
      completedTask: null,
      completedTasks: [],
      newTaskName: "",
      newProjectName: "",
      selectedProject: null,
      enteringProject: null,
      loading: true,
      errorModalMessage: "",
      errorModalVisible: false,
      modalOpen: false,
      modalContent: "",
      activeTask: {
        name: null,
        created_at: null,
        finished_at: null,
        date: null,
        isStarted: null,
        isFinished: null,
        project_id: null,
        user_id: null,
      },
    };
  },
  created() {
    this.fetchLocal();
    this.fetchProjectsAndTasks();
    this.fetchCompletedTasks();
    this.checkActiveTask();
  },
  methods: {
    showErrorModal(errorMessage) {
      this.errorModalMessage = errorMessage;
      this.errorModalVisible = true;
    },
    closeErrorModal() {
      this.errorModalVisible = false;
    },
    openModal(content, task) {
      this.fetchProjects();
      this.modalContent = content;
      this.taskforchangetask = task;

      this.modalOpen = true;
    },
    checkActiveTask() {
      const storedTask = JSON.parse(localStorage.getItem("activeTask"));
      if (storedTask && storedTask.isFinished === false) {
        this.showErrorModal(
          "Something went wrong while you have an active task. Please try again."
        );
        localStorage.removeItem("activeTask");
      }
    },
    async fetchProjectsAndTasks() {
      const { data: projectsWithTasks, error: fetchError } = await supabase
        .from("Project")
        .select(
          `
      id,
      name
      `
        )
        .eq("user_id", this.user.id);

      if (fetchError) {
        this.showErrorModal(
          "Something went wrong while fetching projects and tasks. Please try again."
        );
        return;
      }

      const tasksMap = {};

      for (const project of projectsWithTasks) {
        const { data: tasks, error: tasksError } = await supabase
          .from("Task")
          .select("id, name, isEnded, finished_at, totalSeconds")
          .eq("project_id", project.id)
          .order("finished_at", { ascending: false });

        if (tasksError) {
          this.showErrorModal(
            "Something went wrong while fetching tasks. Please try again."
          );
          return;
        }

        tasksMap[project.id] = tasks;
      }

      this.projects = projectsWithTasks.map((project) => ({
        ...project,
        tasks: tasksMap[project.id] || [],
        isProjectOpen: false,
      }));

      this.loading = false;
    },
    async fetchProjects() {
      const { data: projects, error: fetchError } = await supabase
        .from("Project")
        .select(
          `
      id,
      name
      `
        )
        .eq("user_id", this.user.id);

      if (fetchError) {
        this.showErrorModal(
          "Something went wrong while fetching projects. Please try again."
        );
        return;
      }

      this.justprojects = projects;
    },
    async assignProjectSelectedTask(project, task) {
      const { update } = await supabase
        .from("Task")
        .update({ project_id: project.id })
        .eq("id", task.id);
      console.log("update", update);

      this.modalOpen = false;
      this.completedTasks = [];
      this.fetchCompletedTasks();

      this.projects = [];
      this.fetchProjectsAndTasks();

      this.selectedProject = null;
      this.enteringProject = null;

      this.currentTask = null;
    },
    async setProjecttoNullSelectedTask(task) {
      const { update } = await supabase
        .from("Task")
        .update({ project_id: null })
        .eq("id", task.id);
      console.log("update", update);

      this.modalOpen = false;
      this.completedTasks = [];
      this.fetchCompletedTasks();

      this.projects = [];
      this.fetchProjectsAndTasks();

      this.selectedProject = null;
      this.enteringProject = null;

      this.currentTask = null;
    },
    async fetchCompletedTasks() {
      const { data: completedTasks, error: completedTasksError } =
        await supabase
          .from("Task")
          .select()
          .eq("user_id", this.user.id)
          .eq("isEnded", true)
          .order("finished_at", { ascending: false })
          .select(
            `
            *,
            project:project_id (
              name
            )
          `
          );

      if (completedTasksError) {
        this.showErrorModal(
          "Something went wrong while fetching completed tasks. Please try again."
        );
        return;
      }
      completedTasks.forEach((task) => {
        if (task.project === null) {
          task.project = { name: "This task has no project" };
        }
      });

      this.completedTasks.push(completedTasks);

      this.loading = false;
    },
    fetchLocal() {
      const user = localStorage.getItem("user");
      if (user) {
        this.user = JSON.parse(user);
      } else {
        localStorage.removeItem("user");
        this.showErrorModal("You are not logged in. Please log in.");
        this.$router.push("/login");
      }
    },
    async addNewProject() {
      if (this.newProjectName) {
        const newProject = {
          name: this.newProjectName,
          user_id: this.user.id,
        };
        const { error } = await supabase.from("Project").insert([newProject]);
        this.fetchProjectsAndTasks();

        if (error) {
          return;
        }
        this.newProjectName = "";
      } else {
        this.showErrorModal("Please enter a project name.");
      }
    },
    startTask() {
      if (this.newTaskName && this.selectedProject) {
        this.currentTask = { id: Date.now(), name: this.newTaskName };
        this.newTaskName = "";
        this.startTime = new Date().getTime();
        this.timerInterval = setInterval(this.updateTimer, 1000);
        this.timerRunning = true;

        this.activeTask.name = this.currentTask.name;
        this.activeTask.created_at = new Date();
        this.activeTask.finished_at = null;
        this.activeTask.date = new Date();
        this.activeTask.isStarted = true;
        this.activeTask.isFinished = false;
        this.activeTask.project_id = this.selectedProject.id;
        this.activeTask.user_id = this.user.id;
        localStorage.setItem("activeTask", JSON.stringify(this.activeTask));
      } else {
        this.showErrorModal("Please enter a task name.");
      }
    },
    //belki kullanırım
    async resumeTaskFromSidebar(task) {
      const project = await supabase
        .from("Project")
        .select()
        .eq("id", task.project_id)
        .single();
      this.selectedProject = project;
      this.enteringProject = project;
      this.currentTask = task;
      this.startTime = new Date().getTime();
      this.timerInterval = setInterval(this.updateTimer, 1000);
      this.timerRunning = true;

      this.activeTask.name = this.currentTask.name;
      this.activeTask.created_at = new Date();
      this.activeTask.finished_at = null;
      this.activeTask.date = new Date();
      this.activeTask.isStarted = true;
      this.activeTask.isFinished = false;
      this.activeTask.project_id = this.selectedProject.id;
      this.activeTask.user_id = this.user.id;
      localStorage.setItem("activeTask", JSON.stringify(this.activeTask));
    },
    async stopTask() {
      clearInterval(this.timerInterval);
      this.timerRunning = false;
      this.activeTask.finished_at = new Date();
      this.activeTask.isFinished = true;
      const seconds = Math.floor(
        (this.activeTask.finished_at - this.activeTask.created_at) / 1000
      );

      await supabase
        .from("Task")
        .insert([
          {
            name: this.activeTask.name,
            created_at: this.activeTask.created_at,
            finished_at: this.activeTask.finished_at,
            date: this.activeTask.date,
            isStarted: this.activeTask.isStarted,
            isEnded: this.activeTask.isFinished,
            project_id: this.activeTask.project_id,
            user_id: this.activeTask.user_id,
            totalSeconds: seconds,
          },
        ])
        .then(({ error }) => {
          if (error) {
            this.showErrorModal(
              "Something went wrong while updating the task. Please try again."
            );
          } else {
            this.activeTask = {
              name: null,
              created_at: null,
              finished_at: null,
              date: null,
              isStarted: null,
              isFinished: null,
              project_id: null,
            };
            localStorage.removeItem("activeTask");
            this.currentTask = null;
            this.completedTasks = [];
            this.selectedProject = null;
            this.fetchProjectsAndTasks();
            this.fetchCompletedTasks();
          }
        });
    },
    updateTimer() {
      this.secondsElapsed = Math.floor(
        (new Date().getTime() - this.startTime) / 1000
      );
    },
    formatTime(dateTimeString) {
      const date = new Date(dateTimeString);
      const hours = date.getHours().toString().padStart(2, "0");
      const minutes = date.getMinutes().toString().padStart(2, "0");
      return `${hours}:${minutes}`;
    },
    calculateSeconds(task) {
      const startTime = new Date(task.created_at).getTime();
      const endTime = new Date(task.finished_at).getTime();
      const seconds = Math.floor((endTime - startTime) / 1000);
      const minutes = Math.floor(seconds / 60);
      const remainderSeconds = seconds % 60;
      const hours = Math.floor(minutes / 60);
      const remainderMinutes = minutes % 60;

      return `${hours.toString().padStart(2, "0")}:${remainderMinutes
        .toString()
        .padStart(2, "0")}:${remainderSeconds.toString().padStart(2, "0")}`;
    },
    calculateSecondsSideBar(totalSeconds) {
      const realSeconds = totalSeconds;
      const minutes = Math.floor(realSeconds / 60);
      const remainderSeconds = realSeconds % 60;
      const hours = Math.floor(minutes / 60);
      const remainderMinutes = minutes % 60;
      const returnString = `${hours
        .toString()
        .padStart(2, "0")}:${remainderMinutes
        .toString()
        .padStart(2, "0")}:${remainderSeconds.toString().padStart(2, "0")}`;
      return returnString;
    },
    formatDate(dateString) {
      const date = new Date(dateString);
      const today = new Date();
      const yesterday = new Date(today - 86400000);

      const options = {
        year: "numeric",
        month: "short",
        day: "numeric",
      };

      const formattedDate = date.toLocaleDateString("en-US", options);

      if (date.toDateString() === today.toDateString()) {
        return `Today`;
      } else if (date.toDateString() === yesterday.toDateString()) {
        return `Yesterday`;
      } else {
        const daysOfWeek = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
        const dayOfWeek = daysOfWeek[date.getDay()];
        return `${formattedDate}, ${dayOfWeek}`;
      }
    },
    logout() {
      supabase.auth.signOut();
      localStorage.removeItem("user");
      this.$router.push("/login");
    },
    toggleProject(project) {
      project.isProjectOpen = !project.isProjectOpen;
    },
    async deleteProject(project) {
      const index = this.projects.findIndex((p) => p.id === project.id);
      if (index !== -1) {
        const { error } = await supabase
          .from("Project")
          .delete()
          .eq("id", project.id);
        if (error) {
          this.showErrorModal(
            "Something went wrong while deleting the project. Please try again."
          );
          return;
        }
        this.projects.splice(index, 1);
        this.completedTasks = [];
        this.fetchCompletedTasks();
      }
    },
    async deleteTask(project, task) {
      const projectIndex = this.projects.findIndex((p) => p.id === project.id);
      if (projectIndex !== -1) {
        const taskIndex = this.projects[projectIndex].tasks.findIndex(
          (t) => t.id === task.id
        );
        if (taskIndex !== -1) {
          const { error } = await supabase
            .from("Task")
            .delete()
            .eq("id", task.id);
          if (error) {
            this.showErrorModal(
              "Something went wrong while deleting the task. Please try again."
            );
            return;
          }
          this.projects[projectIndex].tasks.splice(taskIndex, 1);
          this.completedTasks = [];
          this.fetchCompletedTasks();
        }
      }
    },
    enterProject(project) {
      this.selectedProject = project;
      this.enteringProject = project;
    },
    setSelectedProjectToNull() {
      this.selectedProject = null;
    },
    continueWithoutProject() {
      this.selectedProject = "none";
      this.enteringProject = "none";
    },
  },
  watch: {
    enteringProject(newValue) {
      if (newValue) {
        this.selectedProject = newValue;
        this.enteringProject = null;
      }
      this.newTaskName = "";
      this.currentTask = null;
      this.timerRunning = false;
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
.app {
  display: flex;
  height: 100vh;
  margin: 0;
  padding: 0;
}

.sidebar {
  width: 200px;
  padding: 20px;
  border-right: 1px solid #ccc;
  background-color: #2d1238;
  overflow-y: auto;
}

.main {
  padding: 20px;
  flex-grow: 1;
  overflow-y: auto;
  background-color: #fef9f7;
}

ul {
  list-style-type: none;
  padding-left: 20px;
  margin: 10px 0;
}

button {
  background-color: #3490dc;
  color: #fff;
  border: none;
  padding: 10px 20px;
  cursor: pointer;
  font-size: 16px;
  margin-bottom: 10px;
  border-radius: 5px;
}
.create-button {
  background-color: #fef9f7;
  color: #fff;
  border: none;
  padding: 5px 10px;
  cursor: pointer;
  font-size: 16px;
  margin-top: 10px;
  margin-bottom: 10px;
  margin-left: 10px;
  border-radius: 5px;
}
.create-button img {
  width: 20px;
  height: 20px;
  align-items: center;
  justify-content: center;
  margin: 5px 0px 0px 0px;
}
.select-button {
  background-color: #a84c94;
  color: #fff;
  border: none;
  padding: 5px 15px;
  cursor: pointer;
  margin-bottom: 10px;
  border-radius: 5px;
}

.project-button {
  background-color: rgba(168, 76, 148, 0.7);
  color: #fff;
  border: none;
  padding: 5px 15px;
  cursor: pointer;
  font-size: small;
  margin-bottom: 10px;
  border-radius: 5px;
}
.project-button2 {
  background-color: rgba(198, 30, 30, 0.7);
  color: #fff;
  border: none;
  padding: 5px 15px;
  cursor: pointer;
  font-size: small;
  margin-bottom: 10px;
  border-radius: 5px;
}
.kapat-button {
  background-color: rgba(198, 30, 30, 0.7);
  color: #fff;
  border: none;
  padding: 5px 15px;
  cursor: pointer;
  font-size: small;
  margin-bottom: 10px;
  border-radius: 5px;
}

.select-button img {
  width: 20px;
  height: 20px;
  align-items: center;
  justify-content: center;
  margin: 5px 0px 0px 0px;
}
.back-button {
  background-color: #a84c94;
  color: #fff;
  border: none;
  padding: 10px 20px;
  cursor: pointer;
  margin-bottom: 10px;
  border-radius: 50px;
  width: 60px;
  height: 60px;
  justify-content: center;
  align-items: center;
  margin-right: 3.5%;
}
.back-button img {
  width: 20px;
  height: 20px;
  align-items: center;
  justify-content: center;
  margin: 5px 0px 0px 0px;
}
.button-container {
  display: flex;
  flex-direction: column;
  align-items: center;
}
.completed-task-info {
  display: flex;
  justify-content: space-between;
  align-items: center;
  border: 1px solid #ccc;
  padding: 10px;
  border-radius: 5px;
  background-color: #f9f9f9;
  margin-bottom: 5px;
  display: flex;
  align-items: center;
  justify-content: space-between;
}
.start-button {
  background-color: #a84c94;
  color: #fff;
  border: none;
  padding: 10px 20px;
  cursor: pointer;
  margin-bottom: 10px;
  border-radius: 50px;
  width: 60px;
  height: 60px;
  justify-content: center;
  align-items: center;
}
.start-button img {
  width: 20px;
  height: 20px;
  align-items: center;
  justify-content: center;
  margin: 5px 0px 0px 0px;
}
.stop-button {
  background-color: #a84c94;
  color: #fff;
  border: none;
  padding: 10px 20px;
  cursor: pointer;
  margin-bottom: 10px;
  border-radius: 50px;
  width: 60px;
  height: 60px;
  justify-content: center;
  align-items: center;
}
.stop-button img {
  width: 20px;
  height: 20px;
  align-items: center;
  justify-content: center;
  margin: 5px 0px 0px 0px;
}
.loading-text {
  margin: 0;
  padding: 0;
  font-size: 18px;
  color: whitesmoke;
}

.delete-button {
  background-color: transparent;
  color: #dc3545;
  border: none;
  padding: 5px;
  cursor: pointer;
  font-size: 30px;
  border-radius: 3px;
  margin-left: 0%;
  margin-top: 2%;
}

input {
  padding: 10px;
  font-size: 16px;
  border: 1px solid #ccc;
  margin-right: 10px;
  margin-bottom: 10px;
  width: 30%;
}

h4 {
  opacity: 0.5;
}
.sidebar-h4 {
  color: whitesmoke;
  opacity: 0.5;
}

.sidebar-h2 {
  color: whitesmoke;
  margin-top: 0;
}
.sidebar-h3 {
  color: whitesmoke;
  margin-bottom: 10px;
}

h2 {
  margin-top: 0;
}

h3 {
  margin-bottom: 10px;
}

.active {
  font-weight: bold;
}

.completed-tasks {
  margin-top: 0px;
  border-top: 1px solid #ccc;
  padding-top: 0px;
  display: flex;
  width: 50%;
  margin-right: auto;
  margin-left: auto;
  flex-direction: column;
}

.completed-tasks h3 {
  margin-bottom: 10px;
}

.completed-tasks ul {
  list-style: none;
  padding-left: 0;
}

.completed-tasks li {
  margin-bottom: 10px;
  padding: 10px;
  border: 1px solid #ccc;
  border-radius: 5px;
  background-color: #ffffff;
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-direction: column;
}

.completed-tasks li h4 {
  margin: 0;
}

.completed-tasks li div {
  flex-grow: 1;
  display: flex;
  align-items: center;
}

.completed-task-name {
  font-weight: bold;
  margin-right: 10px;
  flex-grow: 1;
}

.completed-task-date {
  opacity: 0.7;
  margin-right: 10px;
}

.completed-task-time {
  opacity: 0.7;
}
.completed-task-start-end {
  opacity: 0.7;
  margin-right: 10px;
}

.project-input {
  margin: 10px 4px;
  width: auto;
  display: flex;
}
.project-label {
  width: 80%;
  margin: auto;
  background-color: #fef9f7;
}

.completed-tasks {
  margin-top: 20px;
}

.completed-tasks h3 {
  margin-bottom: 10px;
}

.loading-screen {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100%;
  font-size: 18px;
  color: #999;
}

@keyframes spin {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
}
.no-tasks {
  font-style: italic;
  opacity: 0.7;
  margin: auto;
  text-align: center;
}

.projects-grid .project-card li.no-tasks {
  display: flex;
  justify-content: center;
  align-items: center;
}

.spinner {
  border: 4px solid rgba(0, 0, 0, 0.3);
  border-top: 4px solid #a84c94;
  border-radius: 50%;
  width: 40px;
  height: 40px;
  animation: spin 1s linear infinite;
}
.completed-tasks {
  margin-top: 20px;
}

.completed-tasks h3 {
  margin-bottom: 10px;
}

.logout-button {
  position: relative;
  bottom: 0px;
  left: 0px;
  background-color: #fef9f7;
  color: #fff;
  padding: 5px 10px;
  cursor: pointer;
  border-radius: 5px;
  margin-left: 0%;
  margin-top: 10px;
  display: flex;
  align-items: center;
}

.logout-button img {
  width: 30px;
  height: 30px;
  margin-right: 5px;
}
.task-input {
  padding: 10px;
  font-size: 16px;
  border: 1px solid #ccc;
  margin-right: 10px;
  margin-bottom: 10px;
  width: 700px;
}

.projects-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 10px;
}

.project-card {
  padding: 5px 10px;
  border-radius: 5px;
  background-color: #fef9f7;
  box-shadow: 0 0 5px rgba(0, 0, 0, 0.2);
}

.project-name {
  cursor: pointer;
  font-weight: bold;
}

.project-header {
  display: flex;
  align-items: center;
}

.project-header button {
  margin-left: 10px;
}

.project-name {
  cursor: pointer;
  font-weight: bold;
  display: flex;
  margin-left: 0;
  align-items: center;
  justify-content: flex-start;
  text-align: left;
  width: 100%;
}

.project-tasks {
  padding-left: 30px;
  width: 100%;
}

.project-task {
  display: flex;
  align-items: center;
}

.project-task button {
  margin-left: 10px;
}
.modal {
  background-color: #fef9f7;
  border-left: 2px solid #2d1238;
  padding-left: 3%;
  padding-right: 3%;
}

.projects-grid .project-card ul {
  padding-left: 0;
}
.project-tasks li {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px;
  border: 1px solid #ccc;
  border-radius: 5px;
  background-color: #ffffff;
  margin-bottom: 10px;
}
</style>
