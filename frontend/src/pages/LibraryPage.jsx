import MotionPage from "../components/MotionPage";
import ExerciseCard from "../components/ExerciseCard";

const exercises = [
  {
    name: "Pushups",
    image: "https://images.unsplash.com/photo-1598971639058-a29a0f8a6c06?q=80&w=1470&auto=format&fit=crop",
    instructions: "Keep your body aligned, lower chest near floor, and push up with control.",
    difficulty: "Beginner",
    calories: 80,
    video: "https://www.youtube.com/embed/IODxDxX7oi4"
  },
  {
    name: "Squats",
    image: "https://images.unsplash.com/photo-1434682881908-b43d0467b798?q=80&w=1470&auto=format&fit=crop",
    instructions: "Feet shoulder-width apart, chest up, and drive through your heels.",
    difficulty: "Beginner",
    calories: 70,
    video: "https://www.youtube.com/embed/aclHkVaku9U"
  },
  {
    name: "Plank",
    image: "https://images.unsplash.com/photo-1596357395104-55f35c59f2f8?q=80&w=1374&auto=format&fit=crop",
    instructions: "Brace core, keep hips level, and hold neutral spine.",
    difficulty: "Intermediate",
    calories: 50,
    video: "https://www.youtube.com/embed/pSHjTRCQxIw"
  },
  {
    name: "Lunges",
    image: "https://images.unsplash.com/photo-1605296867724-fa87a8ef53fd?q=80&w=1470&auto=format&fit=crop",
    instructions: "Step forward, lower rear knee, and keep front knee aligned with toes.",
    difficulty: "Intermediate",
    calories: 75,
    video: "https://www.youtube.com/embed/QOVaHwm-Q6U"
  },
  {
    name: "Jumping Jacks",
    image: "https://images.unsplash.com/photo-1486218119243-13883505764c?q=80&w=1470&auto=format&fit=crop",
    instructions: "Maintain rhythm and soft landings while keeping your core tight.",
    difficulty: "Beginner",
    calories: 90,
    video: "https://www.youtube.com/embed/c4DAnQ6DtF8"
  }
];

const LibraryPage = () => (
  <MotionPage>
    <section>
      <h1 className="section-title">Exercise Library</h1>
      <p className="mt-2 text-sm text-slate-300">Browse exercises with instructions, difficulty, calories, and videos.</p>
      <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {exercises.map((exercise) => (
          <ExerciseCard key={exercise.name} exercise={exercise} />
        ))}
      </div>
    </section>
  </MotionPage>
);

export default LibraryPage;
