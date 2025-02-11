export default function Heroes() {
  return (
    <div className="flex flex-col items-center justify-center max-w-5xl">
      <div className="flex items-center">
        <div className="relative w-[300px] h-[300px] sm:w-[350px] sm:h-[350px] md:h-[400px] md:w-[400px]">
          <img
            src="/landing/magic.png"
            className="object-contain"
            alt="Magic"
          />
        </div>
        <div className="relative h-[400px] w-[400px] hidden md:block">
          <img
            src="/landing/puzzle.png"
            className="object-contain"
            alt="Puzzle"
          />
        </div>
      </div>
    </div>
  );
}
